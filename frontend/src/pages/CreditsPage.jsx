import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Search, DollarSign, Calendar, Trash2, ArrowUpRight, ArrowDownRight, CreditCard, UserCheck, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

export const CreditsPage = () => {
  const [credits, setCredits] = useState([]);
  const [summary, setSummary] = useState({ total_credits: 0, total_expenses: 0, net_balance: 0, by_method: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [receivedFrom, setReceivedFrom] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [category, setCategory] = useState('Personal');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const fetchCredits = async () => {
    try {
      const res = await api.get('/credits');
      setCredits(res.data.credits || []);
      setSummary(res.data.summary || { total_credits: 0, total_expenses: 0, net_balance: 0, by_method: {} });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  const handleCreateCredit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !amount) return;

    try {
      await api.post('/credits', {
        title,
        amount: parseFloat(amount),
        received_from: receivedFrom,
        payment_method: paymentMethod,
        category,
        date,
        notes,
      });

      setShowModal(false);
      setTitle('');
      setAmount('');
      setReceivedFrom('');
      setNotes('');
      fetchCredits();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCredit = async (id) => {
    if (!window.confirm('Delete this credit entry?')) return;
    try {
      await api.delete(`/credits/${id}`);
      fetchCredits();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredCredits = credits.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.received_from && c.received_from.toLowerCase().includes(search.toLowerCase())) ||
      (c.notes && c.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesMethod =
      methodFilter === 'All' ? true : c.payment_method.toLowerCase() === methodFilter.toLowerCase();
    return matchesSearch && matchesMethod;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-emerald-400 font-semibold animate-pulse">Loading Credits & Income...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Wallet className="w-8 h-8 text-emerald-400" /> Cash Received & Credits
          </h1>
          <p className="text-xs text-slate-400 mt-1">Log cash given to you, freelance income & credit allowances</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-xl shadow-emerald-500/25 hover:opacity-95 transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Log Cash / Credit</span>
        </button>
      </div>

      {/* Summary Banner Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Net Cash Balance */}
        <div className="glass-panel rounded-3xl p-5 border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-slate-900/50 to-slate-900/70">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Net Available Balance</span>
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div className={`text-3xl font-black ${summary.net_balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${summary.net_balance.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Total Credits (${summary.total_credits.toFixed(2)}) - Total Expenses (${summary.total_expenses.toFixed(2)})
          </div>
        </div>

        {/* Total Cash Received */}
        <div className="glass-panel rounded-3xl p-5 border border-teal-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Cash / Income</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">${summary.total_credits.toFixed(2)}</div>
          <div className="text-[11px] text-emerald-400 mt-1">All money & cash credits received</div>
        </div>

        {/* Total Expenses */}
        <div className="glass-panel rounded-3xl p-5 border border-rose-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Expenses Out</span>
            <ArrowDownRight className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-white">${summary.total_expenses.toFixed(2)}</div>
          <div className="text-[11px] text-rose-300 mt-1">Total money spent so far</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search credits or sender..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Method Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1">Payment:</span>
          {['All', 'Cash', 'UPI', 'Bank Transfer', 'Other'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                methodFilter === m
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Credit Entries List */}
      <div className="glass-panel rounded-3xl p-6 border border-white/10 space-y-4">
        <h3 className="font-bold text-white text-lg flex items-center justify-between">
          <span>Income & Cash Credit History</span>
          <span className="text-xs text-slate-400 font-normal">{filteredCredits.length} entries</span>
        </h3>

        {filteredCredits.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No credit entries found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCredits.map((credit) => (
              <div
                key={credit.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition gap-4"
              >
                <div className="flex items-center space-x-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400">
                    <ArrowUpRight className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-sm truncate">{credit.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-slate-300 mt-0.5">
                      {credit.received_from && (
                        <span className="flex items-center gap-1 text-emerald-300 font-semibold">
                          <UserCheck className="w-3.5 h-3.5" /> From: {credit.received_from}
                        </span>
                      )}
                      {credit.notes && <span className="text-slate-400 truncate">• {credit.notes}</span>}
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {credit.date ? new Date(credit.date).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-indigo-400" />
                        {credit.payment_method}
                      </span>
                      <span className="font-semibold px-2 py-0.5 rounded-full bg-slate-800/80 text-purple-300">
                        {credit.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0">
                  <span className="font-black text-emerald-400 text-base">
                    +${credit.amount.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleDeleteCredit(credit.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                    title="Delete credit entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Log Credit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Log Cash / Credit Received</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCredit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Credit Title / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Cash given by friend, Freelance payment..."
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="Cash">Cash 💵</option>
                    <option value="UPI">UPI / GPay</option>
                    <option value="Bank Transfer">Bank Transfer 🏛️</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Received From</label>
                  <input
                    type="text"
                    placeholder="Person / Client name..."
                    value={receivedFrom}
                    onChange={(e) => setReceivedFrom(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Office">Office</option>
                    <option value="Friend">Friend</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelance">Freelance</option>
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
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes / Purpose</label>
                <textarea
                  placeholder="Additional details about this cash credit..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
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
                  Save Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
