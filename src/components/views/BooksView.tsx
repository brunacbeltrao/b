import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Star,
  CheckCircle2,
  Clock,
  Bookmark,
  Sparkles,
  Search,
  Filter,
  Flame,
  Award,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookItem, BookCategory } from '../../types';

export const BooksView: React.FC = () => {
  const { books, addBook, updateBookProgress, updateBookStatus, deleteBook } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'todos' | 'lendo' | 'lido' | 'quero_ler'>('todos');
  const [filterCategory, setFilterCategory] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<BookCategory>('Jurídico');
  const [totalPages, setTotalPages] = useState<number | ''>(400);
  const [currentPage, setCurrentPage] = useState<number | ''>(0);
  const [status, setStatus] = useState<'quero_ler' | 'lendo' | 'lido'>('quero_ler');
  const [notes, setNotes] = useState('');

  // Metrics
  const readBooksCount = books.filter(b => b.status === 'lido').length;
  const currentlyReadingCount = books.filter(b => b.status === 'lendo').length;
  const totalBooksGoal = 15;
  const goalProgressPercent = Math.round((readBooksCount / totalBooksGoal) * 100);

  const filteredBooks = books.filter(b => {
    if (filterStatus !== 'todos' && b.status !== filterStatus) return false;
    if (filterCategory !== 'todos' && b.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !totalPages) return;
    addBook({
      title: title.trim(),
      author: author.trim(),
      category,
      totalPages: Number(totalPages),
      currentPage: Number(currentPage) || 0,
      status,
      yearGoal: 2026,
      notes: notes.trim() || undefined,
    });
    setIsAddModalOpen(false);
    setTitle('');
    setAuthor('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header com estética de biblioteca refinada */}
      <div className="rounded-2xl bg-gradient-to-r from-[#faf7f2] via-[#f5ede0] to-[#f0e3ce] p-6 border border-[#e8d9c2] shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#8c6b32] uppercase tracking-wide">
              <span>Estante Intelectual</span>
              <span aria-hidden="true">·</span>
              <span>Formação 2026</span>
              <span aria-hidden="true">·</span>
              <span>FDR & Leituras</span>
            </div>
            <h1 className="font-serif-title text-2xl md:text-3xl font-normal text-[#212021] tracking-tight">
              Livros & Leituras 2026
            </h1>
            <p className="text-sm text-stone-600 font-sans-ui leading-relaxed">
              Obras de doutrina jurídica (Didier, Didier Jr., Streck, Dinamarco), clássicos da literatura, desenvolvimento intelectual e espiritual para fortalecimento do discernimento e da sabedoria.
            </p>
          </div>

          <button
            id="btn-new-book"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8c6b32] hover:bg-[#785b29] text-white font-semibold text-xs transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar à Estante</span>
          </button>
        </div>

        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Meta Anual 2026 Banner */}
      <section
        id="card-meta-leitura"
        className="rounded-2xl bg-white p-6 border border-[#ece8e1] shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#faf2e3] text-[#8c6b32] border border-[#eee0c9]">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif-title text-xl font-bold text-[#212021]">
                Desafio Literário 2026
              </h2>
              <p className="text-xs text-stone-500">
                Meta: {totalBooksGoal} livros • {readBooksCount} lidos até o momento • {currentlyReadingCount} em leitura ativa
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-serif-title font-bold text-[#8c6b32]">
              {readBooksCount} / {totalBooksGoal}
            </div>
            <div className="text-[11px] text-stone-400 uppercase font-semibold">
              {goalProgressPercent}% alcançado
            </div>
          </div>
        </div>

        <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#8c6b32] h-full rounded-full transition-all duration-500"
            style={{ width: `${goalProgressPercent}%` }}
          />
        </div>
      </section>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#ece8e1] shadow-2xs">
        {/* Status filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['todos', 'lendo', 'quero_ler', 'lido'] as const).map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterStatus === st
                  ? 'bg-[#8c6b32] text-white shadow-2xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/80'
              }`}
            >
              {st === 'todos'
                ? 'Todos'
                : st === 'lendo'
                ? 'Lendo Agora'
                : st === 'quero_ler'
                ? 'Quero Ler'
                : 'Concluídos'}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar título ou autor..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
          />
        </div>
      </div>

      {/* Grid de Livros da Estante */}
      {filteredBooks.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center border border-dashed border-[#ddcaa9] space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#faf4ea] flex items-center justify-center text-[#8c6b32]">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif-title text-lg font-bold text-[#212021]">
              Sua estante pessoal está pronta
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Todos os livros de exemplo foram removidos. Adicione agora as leituras reais de 2026, indicando páginas lidas, metas e notas.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#8c6b32] hover:bg-[#785b29] text-white font-semibold text-xs transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Meu Primeiro Livro</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map(book => {
          const progressPercent = Math.round((book.currentPage / book.totalPages) * 100);
          return (
            <div
              key={book.id}
              className="rounded-2xl bg-white p-5 border border-[#ede3d4] shadow-xs hover:border-[#b88c42] transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#faf4ea] text-[#8c6b32] border border-[#ebdcc4]">
                    {book.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <select
                      value={book.status}
                      onChange={e => updateBookStatus(book.id, e.target.value as any)}
                      className="text-[10px] font-semibold rounded-lg px-2 py-0.5 bg-stone-50 border border-stone-200 focus:outline-none"
                    >
                      <option value="lendo">Lendo</option>
                      <option value="quero_ler">Quero Ler</option>
                      <option value="lido">Lido</option>
                    </select>
                    <button
                      onClick={() => deleteBook(book.id)}
                      className="p-1 text-stone-300 hover:text-rose-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif-title font-bold text-base text-[#212021] leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {book.author}
                  </p>
                </div>

                {book.notes && (
                  <p className="text-xs text-stone-600 italic bg-[#faf8f5] p-2.5 rounded-xl border border-[#eee5d8] leading-relaxed line-clamp-3">
                    "{book.notes}"
                  </p>
                )}
              </div>

              {/* Progress and Page Counter */}
              <div className="space-y-2 pt-3 border-t border-[#f4ede2]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500 font-medium">Progresso</span>
                  <span className="font-mono font-bold text-[#8c6b32]">
                    {book.currentPage} / {book.totalPages} pág. ({progressPercent}%)
                  </span>
                </div>

                <div className="w-full bg-[#eee4d5] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8c6b32] h-full rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                {/* Quick page update buttons if reading */}
                {book.status === 'lendo' && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-400">Atualizar leitura:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateBookProgress(book.id, Math.max(0, book.currentPage - 10))}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-stone-100 hover:bg-stone-200 text-stone-700"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => updateBookProgress(book.id, Math.min(book.totalPages, book.currentPage + 10))}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#f5ede0] hover:bg-[#ebdcc4] text-[#8c6b32]"
                      >
                        +10
                      </button>
                      <button
                        onClick={() => updateBookProgress(book.id, Math.min(book.totalPages, book.currentPage + 25))}
                        className="px-2 py-0.5 text-[10px] font-bold rounded bg-[#8c6b32] text-white hover:bg-[#775a28]"
                      >
                        +25
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Modal: Adicionar Novo Livro */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-stone-200 shadow-xl space-y-4">
            <h3 className="font-serif-title text-xl font-bold text-[#212021]">
              Adicionar Livro à Estante 2026
            </h3>
            <form onSubmit={handleCreateBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Título da Obra *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Teoria Geral do Processo"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Autor(a) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fredie Didier Jr."
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as BookCategory)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
                  >
                    <option value="Jurídico">Jurídico</option>
                    <option value="Filosofia & Teoria">Filosofia & Teoria</option>
                    <option value="Literatura Clássica">Literatura Clássica</option>
                    <option value="Desenvolvimento Pessoal">Desenvolvimento Pessoal</option>
                    <option value="Filosofia & Teologia">Filosofia & Teologia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="w-full px-2.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
                  >
                    <option value="quero_ler">Quero Ler</option>
                    <option value="lendo">Lendo Agora</option>
                    <option value="lido">Concluído</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Total de Páginas *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="480"
                    value={totalPages}
                    onChange={e => setTotalPages(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Página Atual
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={currentPage}
                    onChange={e => setCurrentPage(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Notas / Citação Marcante
                </label>
                <textarea
                  rows={2}
                  placeholder="Trecho importante ou reflexão sobre o livro..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8c6b32] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-stone-600 hover:bg-stone-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#8c6b32] text-white hover:bg-[#785b29]"
                >
                  Salvar na Estante
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
