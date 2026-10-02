import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Search, DollarSign, Calendar, Trash2, TrendingUp, Building2, User, ShoppingBag } from 'lucide-react';
import api from '../api/axios';

export const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ total: 0, by_category: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Personal');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data.expenses || []);
      setSummary(res.data.summary || { total: 0, by_category: {} });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    try {
      await api.post('/expenses', {
        title,
        amount: parseFloat(amount),
        category,
        date,
        notes,
      });

      setShowModal(false);
      setTitle('');
      setAmount('');
      setNotes('');
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Delete this expense entry?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      fetchExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory =
      categoryFilter === 'All' ? true : e.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categoryIcons = {
    Office: Building2,
    Personal: User,
    Purchase: ShoppingBag,
    Other: DollarSign,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-emerald-400 font-semibold animate-pulse">Loading Expenses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Receipt className="w-8 h-8 text-emerald-400" /> Expense & Purchase Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track Office, Personal & Purchase spending seamlessly</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 hover:opacity-95 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Expense</span>
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense Card */}
        <div className="glass-panel rounded-3xl p-5 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-slate-900/40 to-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">${summary.total.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-semibold">Total tracked spend</div>
        </div>

        {/* Office Expenses */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Office Spend</span>
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${(summary.by_category?.Office || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Office & work tools</div>
        </div>

        {/* Personal Expenses */}
        <div className="glass-panel rounded-3xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Personal Spend</span>
            <User className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${(summary.by_category?.Personal || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Personal lifestyle</div>
        </div>

        {/* Purchase Expenses */}
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Purchases</span>
            <ShoppingBag className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">
            ${(summary.by_category?.Purchase || 0).toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Goods & gear purchases</div>
        </div>
      </div>

      {/* Filter & Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1">Category:</span>
          {['All', 'Office', 'Personal', 'Purchase', 'Other'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Entries Table / List */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center justify-between">
          <span>Transaction History</span>
          <span className="text-xs text-slate-400 font-normal">{filteredExpenses.length} entries</span>
        </h3>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No expense records found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredExpenses.map((expense) => {
              const IconComp = categoryIcons[expense.category] || DollarSign;
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition gap-4"
                >
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{expense.title}</h4>
                      {expense.notes && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{expense.notes}</p>
                      )}
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A'}
                        </span>
                        <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {expense.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 shrink-0">
                    <span className="font-black text-emerald-400 text-base">
                      ${expense.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Log Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-400" />
                <span>Log New Expense</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Expense Title / Item</label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Keyboard, Groceries..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                    required
                  />
                </div>

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
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes / Description</label>
                <textarea
                  placeholder="Additional details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm resize-none"
                />
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold shadow-lg shadow-emerald-500/25"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
