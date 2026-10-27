import React, { useState } from 'react';
import { Check, Copy, FileText, Plus, Sparkles, Star } from 'lucide-react';
import { Modal } from '../../fdr/ui/components/Modal';
import { CV_TYPES, CvEntry, CvFormat, CvLang, CvType, assembleCv, period, typeOf } from '../../career/cv';
import { BaseRecord, newId, todayLocal, useRecords } from '../../records/useRecords';
import { Button, EmptyState, Input, Label, Panel, SectionTabs, Segmented, Select, Tag, Textarea, cx } from '../ui';

export interface Competencia extends BaseRecord {
  kind: 'competencia';
  date: string; // created
  name: string;
  area: string;
  level: 'quero' | 'desenvolvendo' | 'domino';
  evidence?: string; // one per line
  goal?: string;
  quarter?: string; // e.g. 2026-T4
}

const LEVELS: { id: Competencia['level']; label: string; hint: string }[] = [
  { id: 'domino', label: 'Domino', hint: 'Já faço bem e tenho como provar' },
  { id: 'desenvolvendo', label: 'Desenvolvendo', hint: 'Estou praticando' },
  { id: 'quero', label: 'Quero aprender', hint: 'Ainda não comecei' },
];

const AREAS = ['Jurídica', 'Escrita', 'Negócios', 'Liderança', 'Comunicação', 'Tecnologia', 'Idiomas', 'Outra'];

function currentQuarter() {
  const d = new Date();
  return `${d.getFullYear()}-T${Math.floor(d.getMonth() / 3) + 1}`;
}

const quarterLabel = (q?: string) => (q ? q.replace(/^(\d{4})-T(\d)$/, '$2º tri $1') : '');

export const CareerView: React.FC = () => {
  const [section, setSection] = useState<'cv' | 'competencias'>('cv');
  return (
    <div>
      <SectionTabs
        value={section}
        onChange={setSection}
        tabs={[
          { id: 'cv', label: 'Currículo vivo' },
          { id: 'competencias', label: 'Mapa de competências' },
        ]}
      />
      {section === 'cv' ? <LivingCv /> : <SkillsMap />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Living CV
// ---------------------------------------------------------------------------
const LivingCv: React.FC = () => {
  const { items, loading, error, save, remove } = useRecords<CvEntry>('cv');
  const [editing, setEditing] = useState<CvEntry | null>(null);
  const [generating, setGenerating] = useState(false);
  const [typeFilter, setTypeFilter] = useState<CvType | 'todos'>('todos');

  const sorted = [...items].sort(
    (a, b) => (b.endDate ? 0 : 1) - (a.endDate ? 0 : 1) || b.date.localeCompare(a.date),
  );
  const usedTypes = CV_TYPES.filter((t) => items.some((i) => i.type === t.id));
  const visible = sorted.filter((e) => typeFilter === 'todos' || e.type === typeFilter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-stone-600 max-w-prose">
          Registre cada coisa assim que acontecer: cargos, eventos, competições, artigos, cursos e resultados com números.
        </p>
        <div className="flex gap-2">
          <Button icon={FileText} onClick={() => setGenerating(true)} disabled={items.length === 0}>
            Montar versão
          </Button>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setEditing({ id: newId('cv'), kind: 'cv', date: todayLocal().slice(0, 8) + '01', type: 'cargo', title: '' })}
          >
            Novo registro
          </Button>
        </div>
      </div>

      {usedTypes.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {[{ id: 'todos' as const, label: 'Tudo' }, ...usedTypes].map((t) => (
            <button
              key={t.id}
              onClick={() => setTypeFilter(t.id)}
              aria-pressed={typeFilter === t.id}
              className={cx(
                'h-7 px-2.5 rounded-full border text-[13px]',
                typeFilter === t.id ? 'border-[#ead3da] bg-[#f7ecef] text-[#6f0f2c]' : 'border-[#e6e4e8] bg-white text-stone-600',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      <Panel bodyClassName="!pt-2">
        {loading ? (
          <p className="text-sm text-stone-500 py-3">Carregando…</p>
        ) : error ? (
          <p className="text-sm text-amber-800 py-3">{error}</p>
        ) : visible.length === 0 ? (
          <EmptyState>Nada registrado ainda. Comece pelo que você faz hoje, como a diretoria no Bevilaqua ou a Liga.</EmptyState>
        ) : (
          <ul className="divide-y divide-[#e6e4e8]">
            {visible.map((e) => (
              <li key={e.id}>
                <button onClick={() => setEditing(e)} className="w-full text-left py-3 sm:grid sm:grid-cols-[150px_1fr] sm:gap-4">
                  <div className="text-xs text-stone-500 pt-0.5 tabular-nums">{period(e, 'pt')}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#1c1a1e]">{e.title}</span>
                      {e.featured && <Star className="w-3.5 h-3.5 text-[#8b1538] fill-[#8b1538]" aria-label="Destaque" />}
                      <Tag>{typeOf(e.type).label}</Tag>
                      {!e.titleEn && <span className="text-xs text-stone-400">sem versão em inglês</span>}
                    </div>
                    {e.org && <div className="text-[13px] text-stone-600 mt-0.5">{e.org}</div>}
                    {e.results && (
                      <ul className="mt-1.5 space-y-0.5">
                        {e.results
                          .split('\n')
                          .filter((l) => l.trim())
                          .slice(0, 3)
                          .map((r, i) => (
                            <li key={i} className="text-[13px] text-stone-700 leading-snug">
                              · {r.replace(/^[-•\s]+/, '')}
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {editing && (
        <CvEntryModal
          key={editing.id}
          entry={editing}
          isNew={!items.some((i) => i.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={async (e) => {
            await save(e);
            setEditing(null);
          }}
          onDelete={async () => {
            if (!window.confirm(`Excluir "${editing.title}"?`)) return;
            await remove(editing);
            setEditing(null);
          }}
        />
      )}
      {generating && <CvGenerator entries={items} onClose={() => setGenerating(false)} />}
    </div>
  );
};

const CvEntryModal: React.FC<{
  entry: CvEntry;
  isNew: boolean;
  onClose: () => void;
  onSave: (e: CvEntry) => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ entry, isNew, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState(entry);
  const [showEn, setShowEn] = useState(!!entry.titleEn);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch: Partial<CvEntry>) => setDraft((d) => ({ ...d, ...patch }));
  const toMonth = (iso?: string) => (iso ? iso.slice(0, 7) : '');
  const fromMonth = (m: string) => (m ? `${m}-01` : '');

  return (
    <Modal aberto aoFechar={onClose} titulo={isNew ? 'Novo registro' : 'Registro'} larguraMaxima="max-w-lg">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.title.trim()) return;
          setBusy(true);
          setError('');
          try {
            await onSave({ ...draft, title: draft.title.trim() });
          } catch (err) {
            setError((err as Error).message);
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cv-type">Tipo</Label>
            <Select id="cv-type" value={draft.type} onChange={(e) => set({ type: e.target.value as CvType })}>
              {CV_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="cv-org">Onde</Label>
            <Input id="cv-org" value={draft.org || ''} onChange={(e) => set({ org: e.target.value || undefined })} placeholder="Ex.: Bevilaqua" />
          </div>
        </div>
        <div>
          <Label htmlFor="cv-title">Título</Label>
          <Input id="cv-title" autoFocus value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder="Ex.: Diretora de Negócios" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="cv-start">Início</Label>
            <Input id="cv-start" type="month" value={toMonth(draft.date)} onChange={(e) => set({ date: fromMonth(e.target.value) })} />
          </div>
          <div>
            <Label htmlFor="cv-end">Fim</Label>
            <Input id="cv-end" type="month" value={toMonth(draft.endDate)} onChange={(e) => set({ endDate: fromMonth(e.target.value) || undefined })} />
            <p className="text-xs text-stone-500 mt-1">Vazio = atual</p>
          </div>
        </div>
        <div>
          <Label htmlFor="cv-desc">O que você fez</Label>
          <Textarea id="cv-desc" rows={2} value={draft.description || ''} onChange={(e) => set({ description: e.target.value || undefined })} />
        </div>
        <div>
          <Label htmlFor="cv-results">Resultados com números (um por linha)</Label>
          <Textarea
            id="cv-results"
            rows={3}
            value={draft.results || ''}
            onChange={(e) => set({ results: e.target.value || undefined })}
            placeholder={'Ex.: Fechei 14 contratos no ciclo (meta 20)\nOrganizei evento com 300 inscritos'}
          />
        </div>
        <div>
          <Label htmlFor="cv-link">Link (artigo, certificado)</Label>
          <Input id="cv-link" type="url" value={draft.link || ''} onChange={(e) => set({ link: e.target.value || undefined })} placeholder="https://" />
        </div>
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input type="checkbox" checked={!!draft.featured} onChange={(e) => set({ featured: e.target.checked })} className="accent-[#8b1538]" />
          Destaque (aparece primeiro nos resumos)
        </label>
        {showEn ? (
          <div className="space-y-3 pt-3 border-t border-[#e6e4e8]">
            <div className="text-[13px] font-medium text-stone-700">Versão em inglês</div>
            <Input value={draft.titleEn || ''} onChange={(e) => set({ titleEn: e.target.value || undefined })} placeholder="Title" aria-label="Título em inglês" />
            <Textarea rows={2} value={draft.descriptionEn || ''} onChange={(e) => set({ descriptionEn: e.target.value || undefined })} placeholder="What you did" aria-label="Descrição em inglês" />
            <Textarea rows={2} value={draft.resultsEn || ''} onChange={(e) => set({ resultsEn: e.target.value || undefined })} placeholder="Results, one per line" aria-label="Resultados em inglês" />
          </div>
        ) : (
          <button type="button" onClick={() => setShowEn(true)} className="text-[13px] font-medium text-[#8b1538] hover:text-[#6f0f2c]">
            + Adicionar versão em inglês
          </button>
        )}
        {error && <p className="text-[13px] text-amber-800">{error}</p>}
        <div className={cx('flex items-center gap-2 pt-1', isNew ? 'justify-end' : 'justify-between')}>
          {!isNew && (
            <Button variant="danger" onClick={onDelete}>
              Excluir
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.title.trim() || busy}>
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

const CvGenerator: React.FC<{ entries: CvEntry[]; onClose: () => void }> = ({ entries, onClose }) => {
  const [format, setFormat] = useState<CvFormat>('cv');
  const [lang, setLang] = useState<CvLang>('pt');
  const [focus, setFocus] = useState('');
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'ia' | 'modelo' | ''>('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const missingEn = lang === 'en' ? entries.filter((e) => !e.titleEn).length : 0;

  const generate = async () => {
    setBusy(true);
    try {
      const res = await fetch('/api/gemini/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          format,
          lang,
          focus,
          entries: entries.map(({ id, kind, fileId, ...rest }) => ({ ...rest, typeLabel: typeOf(rest.type).label })),
        }),
      });
      const data = res.ok ? await res.json() : { success: false };
      if (data.success && data.text) {
        setText(data.text.trim());
        setMode('ia');
        return;
      }
    } catch {
      // fall back to the template below
    } finally {
      setBusy(false);
    }
    setText(assembleCv(entries, format, lang, focus.trim()));
    setMode('modelo');
  };

  return (
    <Modal aberto aoFechar={onClose} titulo="Montar versão" larguraMaxima="max-w-2xl">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Segmented<CvFormat>
            value={format}
            onChange={setFormat}
            options={[
              { value: 'cv', label: 'Currículo' },
              { value: 'perfil', label: 'Perfil curto' },
              { value: 'candidatura', label: 'Candidatura' },
            ]}
          />
          <Segmented<CvLang>
            value={lang}
            onChange={setLang}
            options={[
              { value: 'pt', label: 'Português' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>
        <div>
          <Label htmlFor="cv-focus">Para qual vaga ou foco? (opcional)</Label>
          <Input id="cv-focus" value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Ex.: estágio em M&A num escritório de São Paulo" />
        </div>
        {missingEn > 0 && (
          <p className="text-[13px] text-stone-600">
            {missingEn} {missingEn === 1 ? 'registro não tem' : 'registros não têm'} versão em inglês; sem a IA, eles saem em português.
          </p>
        )}
        <Button variant="primary" icon={Sparkles} onClick={generate} disabled={busy}>
          {busy ? 'Montando…' : text ? 'Montar de novo' : 'Montar'}
        </Button>
        {text && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-stone-500">
                {mode === 'ia' ? 'Escrito pela IA a partir dos seus registros. Revise antes de enviar.' : 'Montado a partir dos seus registros. Ajuste o texto à vontade.'}
              </span>
              <Button
                size="sm"
                variant="ghost"
                icon={copied ? Check : Copy}
                onClick={async () => {
                  await navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </Button>
            </div>
            <Textarea rows={16} value={text} onChange={(e) => setText(e.target.value)} className="font-mono text-[13px]" />
          </div>
        )}
      </div>
    </Modal>
  );
};

// ---------------------------------------------------------------------------
// Skills map
// ---------------------------------------------------------------------------
const SkillsMap: React.FC = () => {
  const { items, loading, error, save, remove } = useRecords<Competencia>('competencia');
  const [editing, setEditing] = useState<Competencia | null>(null);
  const quarter = currentQuarter();
  const goalsThisQuarter = items.filter((c) => c.goal && c.quarter === quarter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-stone-600 max-w-prose">
          O que você domina, o que está desenvolvendo e o que quer aprender, com provas e uma meta pequena por trimestre.
        </p>
        <Button
          variant="primary"
          icon={Plus}
          onClick={() =>
            setEditing({ id: newId('comp'), kind: 'competencia', date: todayLocal(), name: '', area: 'Jurídica', level: 'desenvolvendo', quarter })
          }
        >
          Nova competência
        </Button>
      </div>

      {goalsThisQuarter.length > 0 && (
        <Panel title={`Metas do ${quarterLabel(quarter)}`} className="mb-5">
          <ul className="space-y-2">
            {goalsThisQuarter.map((c) => (
              <li key={c.id} className="text-sm">
                <span className="font-medium text-[#1c1a1e]">{c.name}:</span> <span className="text-stone-700">{c.goal}</span>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {loading ? (
        <Panel>
          <p className="text-sm text-stone-500">Carregando…</p>
        </Panel>
      ) : error ? (
        <Panel>
          <p className="text-sm text-amber-800">{error}</p>
        </Panel>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {LEVELS.map((level) => {
            const list = items.filter((c) => c.level === level.id).sort((a, b) => a.name.localeCompare(b.name));
            return (
              <Panel key={level.id} title={level.label} meta={list.length || undefined} bodyClassName="!pt-0">
                <p className="text-xs text-stone-500 -mt-1 mb-2">{level.hint}</p>
                {list.length === 0 ? (
                  <p className="text-[13px] text-stone-400 py-2">Nada aqui ainda.</p>
                ) : (
                  <ul className="divide-y divide-[#e6e4e8] border-t border-[#e6e4e8]">
                    {list.map((c) => {
                      const evidence = (c.evidence || '').split('\n').filter((l) => l.trim());
                      return (
                        <li key={c.id}>
                          <button onClick={() => setEditing(c)} className="w-full text-left py-2.5">
                            <div className="text-sm font-medium text-[#1c1a1e]">{c.name}</div>
                            <div className="text-xs text-stone-500 mt-0.5">
                              {[c.area, evidence.length ? `${evidence.length} ${evidence.length === 1 ? 'prova' : 'provas'}` : 'sem provas ainda']
                                .filter(Boolean)
                                .join(' · ')}
                            </div>
                            {c.goal && c.quarter === quarter && <div className="text-xs text-[#8b1538] mt-1">Meta: {c.goal}</div>}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      {editing && (
        <SkillModal
          key={editing.id}
          item={editing}
          isNew={!items.some((i) => i.id === editing.id)}
          onClose={() => setEditing(null)}
          onSave={async (c) => {
            await save(c);
            setEditing(null);
          }}
          onDelete={async () => {
            if (!window.confirm(`Excluir "${editing.name}"?`)) return;
            await remove(editing);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
};

const SkillModal: React.FC<{
  item: Competencia;
  isNew: boolean;
  onClose: () => void;
  onSave: (c: Competencia) => Promise<void>;
  onDelete: () => Promise<void>;
}> = ({ item, isNew, onClose, onSave, onDelete }) => {
  const [draft, setDraft] = useState(item);
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<Competencia>) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <Modal aberto aoFechar={onClose} titulo={isNew ? 'Nova competência' : 'Competência'} larguraMaxima="max-w-md">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!draft.name.trim()) return;
          setBusy(true);
          try {
            await onSave({ ...draft, name: draft.name.trim(), quarter: draft.goal ? draft.quarter || currentQuarter() : draft.quarter });
          } finally {
            setBusy(false);
          }
        }}
        className="space-y-4"
      >
        <div>
          <Label htmlFor="sk-name">Competência</Label>
          <Input id="sk-name" autoFocus value={draft.name} onChange={(e) => set({ name: e.target.value })} placeholder="Ex.: Redação de pareceres" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="sk-level">Nível</Label>
            <Select id="sk-level" value={draft.level} onChange={(e) => set({ level: e.target.value as Competencia['level'] })}>
              {LEVELS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="sk-area">Área</Label>
            <Select id="sk-area" value={draft.area} onChange={(e) => set({ area: e.target.value })}>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </Select>
          </div>
        </div>
        <div>
          <Label htmlFor="sk-evidence">Provas (uma por linha)</Label>
          <Textarea
            id="sk-evidence"
            rows={3}
            value={draft.evidence || ''}
            onChange={(e) => set({ evidence: e.target.value || undefined })}
            placeholder={'Ex.: Parecer sobre acordo de acionistas para a Liga\nNota 9,5 em Societário I'}
          />
        </div>
        <div>
          <Label htmlFor="sk-goal">Meta para o {quarterLabel(draft.quarter || currentQuarter())}</Label>
          <Input
            id="sk-goal"
            value={draft.goal || ''}
            onChange={(e) => set({ goal: e.target.value || undefined, quarter: draft.quarter || currentQuarter() })}
            placeholder="Ex.: escrever 2 pareceres revisados por um professor"
          />
        </div>
        <div className={cx('flex items-center gap-2 pt-1', isNew ? 'justify-end' : 'justify-between')}>
          {!isNew && (
            <Button variant="danger" onClick={onDelete}>
              Excluir
            </Button>
          )}
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={!draft.name.trim() || busy}>
              Salvar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
