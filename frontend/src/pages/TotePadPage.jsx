import React, { useState, useEffect } from 'react';
import { NotebookPen, Plus, Search, Pin, Trash2, Edit3, Copy, Check, Sparkles, Tag } from 'lucide-react';
import api from '../api/axios';

export const TotePadPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('General');
  const [color, setColor] = useState('#6366f1');
  const [isPinned, setIsPinned] = useState(false);

  const fetchNotes = async () => {
    try {
      const res = await api.get('/notes');
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory('General');
    setColor('#6366f1');
    setIsPinned(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setCategory(note.category || 'General');
    setColor(note.color || '#6366f1');
    setIsPinned(note.is_pinned);
    setShowModal(true);
  };

  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      if (editingNote) {
        await api.put(`/notes/${editingNote.id}`, {
          title,
          content,
          category,
          color,
          is_pinned: isPinned,
        });
      } else {
        await api.post('/notes', {
          title,
          content,
          category,
          color,
          is_pinned: isPinned,
        });
      }
      setShowModal(false);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await api.post(`/notes/${id}/pin`);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this Tote Pad note?')) return;
    try {
      await api.delete(`/notes/${id}`);
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyNote = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      (n.content && n.content.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'All' ? true : n.category?.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.is_pinned);
  const unpinnedNotes = filteredNotes.filter((n) => !n.is_pinned);

  const categories = ['All', 'Office', 'Personal', 'Purchase', 'General'];
  const colorOptions = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-indigo-400 font-semibold animate-pulse">Loading Tote Pad...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <NotebookPen className="w-8 h-8 text-purple-400" /> Tote Pad & Quick Notes
          </h1>
          <p className="text-xs text-slate-400 mt-1">Instant scratchpad, task memos & categorized thought notes</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs shadow-xl shadow-purple-500/25 hover:opacity-95 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Tote Note</span>
        </button>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pinned Notes Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm tracking-wide">
            <Pin className="w-4 h-4 fill-amber-400" />
            <span>PINNED MEMOS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                copiedId={copiedId}
                onTogglePin={handleTogglePin}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteNote}
                onCopy={handleCopyNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* Regular Notes Section */}
      <div className="space-y-4">
        {pinnedNotes.length > 0 && (
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            All Notes ({unpinnedNotes.length})
          </div>
        )}

        {filteredNotes.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl text-slate-400">
            <NotebookPen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No notes found on your Tote Pad.</p>
            <p className="text-xs text-slate-500 mt-1">Click "New Tote Note" to add your first memo!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unpinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                copiedId={copiedId}
                onTogglePin={handleTogglePin}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteNote}
                onCopy={handleCopyNote}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>{editingNote ? 'Edit Tote Note' : 'Create New Tote Note'}</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Note Title</label>
                <input
                  type="text"
                  placeholder="Note title or subject..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Note Content / Tote Memo</label>
                <textarea
                  placeholder="Type your notes, bullet points, purchases or thoughts..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={5}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="Office">Office</option>
                    <option value="Personal">Personal</option>
                    <option value="Purchase">Purchase</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Theme Color</label>
                  <div className="flex items-center space-x-2 pt-1">
                    {colorOptions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition transform ${
                          color === c ? 'scale-125 border-white shadow-md' : 'border-transparent opacity-70'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="isPinned" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Pin to top of Tote Pad 📌
                </label>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-purple-500/25"
                >
                  {editingNote ? 'Update Note' : 'Save Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NoteCard = ({ note, copiedId, onTogglePin, onEdit, onDelete, onCopy }) => {
  return (
    <div
      className="glass-panel rounded-3xl p-5 border border-white/10 hover:border-purple-500/40 transition flex flex-col justify-between space-y-4 group relative overflow-hidden"
      style={{ borderLeftWidth: '4px', borderLeftColor: note.color || '#6366f1' }}
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-white text-base leading-snug">{note.title}</h3>
          <div className="flex items-center space-x-1 shrink-0">
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1.5 rounded-lg transition ${
                note.is_pinned ? 'text-amber-400 bg-amber-400/10' : 'text-slate-500 hover:text-white'
              }`}
              title={note.is_pinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Tag */}
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5 flex items-center gap-1">
            <Tag className="w-3 h-3 text-purple-400" />
            {note.category || 'General'}
          </span>
        </div>

        {/* Content */}
        {note.content && (
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap font-sans bg-slate-950/40 p-3 rounded-2xl border border-white/5">
            {note.content}
          </p>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-slate-400 text-xs">
        <span className="text-[10px] text-slate-500">
          {new Date(note.updated_at || note.created_at).toLocaleDateString()}
        </span>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onCopy(note.id, `${note.title}\n\n${note.content || ''}`)}
            className="p-1.5 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Copy Note Text"
          >
            {copiedId === note.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 hover:text-indigo-400 rounded-lg hover:bg-slate-800 transition"
            title="Edit Note"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="p-1.5 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
            title="Delete Note"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
