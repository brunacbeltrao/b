import React, { useState } from 'react';
import { Minus, Plus, Search, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookCategory, BookItem } from '../../types';
import { Modal } from '../../fdr/ui/components/Modal';
import { Button, EmptyState, Input, Label, PageActions, Panel, Segmented, Select, Textarea, cx } from '../ui';

const YEAR_GOAL = 15;
const CATEGORIES: BookCategory[] = ['Direito', 'Literatura', 'Espiritualidade', 'Desenvolvimento', 'Outro'];

type Status = BookItem['status'];
const STATUS_LABEL: Record<Status, string> = { lendo: 'Lendo', na_fila: 'Quero ler', lido: 'Lido' };
const SECTIONS: { status: Status; title: string }[] = [
  { status: 'lendo', title: 'Lendo agora' },
  { status: 'na_fila', title: 'Quero ler' },
  { status: 'lido', title: 'Lidos' },
];

const BookRow: React.FC<{ book: BookItem }> = ({ book }) => {
  const { updateBookProgress, updateBookStatus, deleteBook } = useApp();
  const pct = Math.round((book.currentPage / Math.max(1, book.totalPages)) * 100);
  const step = (delta: number) =>
    updateBookProgress(book.id, Math.min(book.totalPages, Math.max(0, book.currentPage + delta)));

  return (
    <li className="group py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-[#1c1a1e] leading-snug">{book.title}</div>
          <div className="text-xs text-stone-500 mt-0.5">
            {book.author} · {book.category}
          </div>
        </div>
        <Select
          value={book.status}
          onChange={(e) => updateBookStatus(book.id, e.target.value as Status)}
          aria-label="Status"
          className="!h-8 !w-auto text-[13px]"
        >
          {Object.entries(STATUS_LABEL).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </Select>
        <button
          onClick={() => {
            if (window.confirm(`Remover "${book.title}" da estante?`)) deleteBook(book.id);
          }}
          aria-label={`Remover ${book.title}`}
          className="h-8 w-8 flex items-center justify-center rounded text-stone-400 hover:text-stone-700 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {book.status !== 'na_fila' && (
        <div className="mt-2.5 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
            <div className="h-full rounded-full bg-[#8b1538]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-stone-500 tabular-nums whitespace-nowrap">
            {book.currentPage} de {book.totalPages} págs
          </span>
          {book.status === 'lendo' && (
            <div className="flex items-center rounded-md border border-[#e6e4e8]">
              <button
                onClick={() => step(-10)}
                aria-label="Voltar 10 páginas"
                className="h-7 w-7 flex items-center justify-center text-stone-500 hover:text-[#1c1a1e]"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => step(10)}
                aria-label="Avançar 10 páginas"
                className="h-7 px-2 border-l border-[#e6e4e8] text-xs text-stone-600 hover:text-[#1c1a1e] tabular-nums"
              >
                +10
              </button>
            </div>
          )}
        </div>
      )}

      {book.notes && <p className="mt-2 text-[13px] text-stone-600 leading-relaxed max-w-prose">{book.notes}</p>}
    </li>
  );
};

export const BooksView: React.FC = () => {
  const { books, addBook } = useApp();
  const [filter, setFilter] = useState<'todos' | Status>('todos');
  const [query, setQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const readCount = books.filter((b) => b.status === 'lido').length;
  const goalPct = Math.min(100, Math.round((readCount / YEAR_GOAL) * 100));

  const matches = (b: BookItem) => {
    const q = query.trim().toLowerCase();
    return !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
  };
  const sections = SECTIONS.filter((s) => filter === 'todos' || s.status === filter).map((s) => ({
    ...s,
    items: books.filter((b) => b.status === s.status && matches(b)),
  }));

  return (
    <div>
      <PageActions
        aside={
          <div className="flex items-center gap-3">
            <span className="tabular-nums">
              <span className="font-semibold text-[#1c1a1e]">{readCount}</span> de {YEAR_GOAL} livros lidos em 2026
            </span>
            <div className="hidden sm:block w-28 h-1.5 rounded-full bg-stone-200 overflow-hidden">
              <div className="h-full bg-[#8b1538] rounded-full" style={{ width: `${goalPct}%` }} />
            </div>
          </div>
        }
      >
        <Button id="btn-new-book" variant="primary" icon={Plus} onClick={() => setModalOpen(true)}>
          Adicionar livro
        </Button>
      </PageActions>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
        <Segmented
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'lendo', label: 'Lendo' },
            { value: 'na_fila', label: 'Quero ler' },
            { value: 'lido', label: 'Lidos' },
          ]}
        />
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar título ou autor"
            className="pl-9"
          />
        </div>
      </div>

      {books.length === 0 ? (
        <Panel>
          <EmptyState>Sua estante está vazia. Adicione o que está lendo agora.</EmptyState>
        </Panel>
      ) : (
        <div className="space-y-5">
          {sections.map((s) => (
            <Panel key={s.status} title={s.title} meta={s.items.length}>
              {s.items.length === 0 ? (
                <p className="text-sm text-stone-500">{query ? 'Nada encontrado.' : 'Nenhum livro aqui.'}</p>
              ) : (
                <ul className="divide-y divide-[#e6e4e8]">
                  {s.items.map((b) => (
                    <BookRow key={b.id} book={b} />
                  ))}
                </ul>
              )}
            </Panel>
          ))}
        </div>
      )}

      <NewBookModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(b) => {
          addBook(b);
          setModalOpen(false);
        }}
      />
    </div>
  );
};

const NewBookModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onSave: (book: Omit<BookItem, 'id'>) => void;
}> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>(CATEGORIES[0]);
  const [status, setStatus] = useState<Status>('na_fila');
  const [total, setTotal] = useState('');
  const [current, setCurrent] = useState('');
  const [notes, setNotes] = useState('');

  const valid = title.trim() && author.trim() && Number(total) > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSave({
      title: title.trim(),
      author: author.trim(),
      category,
      totalPages: Number(total),
      currentPage: status === 'lido' ? Number(total) : Math.min(Number(total), Number(current) || 0),
      status,
      notes: notes.trim() || undefined,
    });
    setTitle('');
    setAuthor('');
    setTotal('');
    setCurrent('');
    setNotes('');
  };

  return (
    <Modal aberto={open} aoFechar={onClose} titulo="Adicionar livro" larguraMaxima="max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="bk-title">Título</Label>
          <Input id="bk-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <div>
          <Label htmlFor="bk-author">Autor(a)</Label>
          <Input id="bk-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bk-cat">Categoria</Label>
            <Select id="bk-cat" value={category} onChange={(e) => setCategory(e.target.value as BookCategory)}>
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="bk-status">Status</Label>
            <Select id="bk-status" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="bk-total">Páginas</Label>
            <Input id="bk-total" inputMode="numeric" value={total} onChange={(e) => setTotal(e.target.value.replace(/\D/g, ''))} />
          </div>
          <div className={cx(status !== 'lendo' && 'opacity-50')}>
            <Label htmlFor="bk-current">Página atual</Label>
            <Input
              id="bk-current"
              inputMode="numeric"
              value={current}
              disabled={status !== 'lendo'}
              onChange={(e) => setCurrent(e.target.value.replace(/\D/g, ''))}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="bk-notes">Notas</Label>
          <Textarea id="bk-notes" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!valid}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
