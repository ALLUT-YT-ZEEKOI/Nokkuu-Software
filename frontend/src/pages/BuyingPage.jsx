import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, DollarSign, ExternalLink, CheckCircle2, Trash2, Tag, Sparkles, Clock, AlertCircle } from 'lucide-react';
import api from '../api/axios';
import confetti from 'canvas-confetti';

export const BuyingPage = () => {
  const [buyingItems, setBuyingItems] = useState([]);
  const [summary, setSummary] = useState({ total_items: 0, wishlist_count: 0, planned_count: 0, purchased_count: 0, total_estimated_budget: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('wishlist');
  const [category, setCategory] = useState('General');
  const [storeUrl, setStoreUrl] = useState('');
  const [notes, setNotes] = useState('');

  const fetchBuyingItems = async () => {
    try {
      const res = await api.get('/buying-items');
      setBuyingItems(res.data.buying_items || []);
      setSummary(res.data.summary || { total_items: 0, wishlist_count: 0, planned_count: 0, purchased_count: 0, total_estimated_budget: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyingItems();
  }, []);

  const triggerConfetti = () => {
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!title.trim() || !estimatedPrice) return;

    try {
      await api.post('/buying-items', {
        title,
        estimated_price: parseFloat(estimatedPrice),
        priority,
        status,
        category,
        store_url: storeUrl || null,
        notes,
      });

      setShowModal(false);
      setTitle('');
      setEstimatedPrice('');
      setStoreUrl('');
      setNotes('');
      fetchBuyingItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPurchased = async (id) => {
    try {
      await api.post(`/buying-items/${id}/buy`);
      triggerConfetti();
      fetchBuyingItems();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Delete this buying item?')) return;
    try {
      await api.delete(`/buying-items/${id}`);
      fetchBuyingItems();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredItems = buyingItems.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus =
      statusFilter === 'All' ? true : item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-amber-400 font-semibold animate-pulse">Loading Buying Wishlist...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-amber-400" /> Buying Planner & Ambitions
          </h1>
          <p className="text-xs text-slate-400 mt-1">Track life ambitions (Car, Bike, Gold Chain/Ring, Food) & auto-log purchases</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setTitle('🏍️ New Sports Bike / Car');
              setEstimatedPrice('2500');
              setCategory('Vehicle');
              setPriority('high');
              setShowModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 font-bold text-xs hover:bg-indigo-600/50 transition flex items-center gap-1.5"
          >
            <span>🚗 Car / Bike</span>
          </button>

          <button
            onClick={() => {
              setTitle('💍 Gold Chain / Ring');
              setEstimatedPrice('1000');
              setCategory('Jewelry');
              setPriority('high');
              setShowModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-amber-600/30 border border-amber-500/40 text-amber-300 font-bold text-xs hover:bg-amber-600/50 transition flex items-center gap-1.5"
          >
            <span>💍 Gold Chain / Ring</span>
          </button>

          <button
            onClick={() => {
              setTitle('🍔 Gourmet Food Experience');
              setEstimatedPrice('120');
              setCategory('Food & Dining');
              setPriority('medium');
              setShowModal(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs hover:bg-rose-600/50 transition flex items-center gap-1.5"
          >
            <span>🍔 Food Outing</span>
          </button>

          <button
            onClick={() => {
              setTitle('');
              setEstimatedPrice('');
              setCategory('General');
              setPriority('medium');
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-500/25 hover:opacity-95 transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Budget */}
        <div className="glass-panel rounded-3xl p-5 border border-amber-500/30 bg-gradient-to-br from-amber-950/30 via-slate-900/40 to-slate-900/60">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Budget</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">${summary.total_estimated_budget.toFixed(2)}</div>
          <div className="text-[11px] text-amber-400 mt-1 font-semibold">Wishlist & planned items budget</div>
        </div>

        {/* Wishlist Items Count */}
        <div className="glass-panel rounded-3xl p-5 border border-purple-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Wishlist Items</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.wishlist_count}</div>
          <div className="text-[11px] text-slate-400 mt-1">Things you want to buy</div>
        </div>

        {/* Planned Items Count */}
        <div className="glass-panel rounded-3xl p-5 border border-indigo-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Planned Purchases</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.planned_count}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ready for near future buy</div>
        </div>

        {/* Purchased Items Count */}
        <div className="glass-panel rounded-3xl p-5 border border-emerald-500/30">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Purchased Items</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{summary.purchased_count}</div>
          <div className="text-[11px] text-emerald-400 mt-1">Logged into Expenses</div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl glass-input text-xs"
          />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-400 mr-1">Status:</span>
          {['All', 'Wishlist', 'Planned', 'Purchased'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-500/30'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Buying Items Grid */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 glass-panel rounded-3xl text-slate-400">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-base">No items match your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Click "Add Buying Item" to save something you want to buy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`glass-panel rounded-3xl p-5 border transition flex flex-col justify-between space-y-4 ${
                  item.status === 'purchased'
                    ? 'border-emerald-500/30 bg-emerald-950/10 opacity-75'
                    : 'border-white/10 hover:border-amber-500/40'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className={`font-bold text-base ${item.status === 'purchased' ? 'line-through text-slate-400' : 'text-white'}`}>
                      {item.title}
                    </h3>
                    {item.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-white/5 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" />
                      {item.category || 'General'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                      item.status === 'purchased'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'planned'
                        ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Price Banner */}
                  <div className="text-xl font-black text-amber-400 mb-2">
                    ${item.estimated_price.toFixed(2)}
                  </div>

                  {/* Notes */}
                  {item.notes && (
                    <p className="text-xs text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 mb-2">
                      {item.notes}
                    </p>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {item.store_url && (
                      <a
                        href={item.store_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        <span>Link</span>
                      </a>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    {item.status !== 'purchased' && (
                      <button
                        onClick={() => handleMarkPurchased(item.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Bought 🛒</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Buying Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-white/20 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Add Buying Item / Wishlist</span>
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white font-bold text-lg px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Item Name / Product</label>
                <input
                  type="text"
                  placeholder="e.g. 4K Monitor, Headphones..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Estimated Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
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
                    <option value="Vehicle">Vehicle (Car 🚗 / Bike 🏍️)</option>
                    <option value="Jewelry">Jewelry (Gold Chain 🪙 / Ring 💍)</option>
                    <option value="Food & Dining">Food & Dining 🍔</option>
                    <option value="Life Ambition">Life Ambition 🌟</option>
                    <option value="Tech">Tech & Gadgets 💻</option>
                    <option value="Office">Office 🏢</option>
                    <option value="Personal">Personal 🏠</option>
                    <option value="General">General 📦</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High 🔥</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm bg-slate-900 text-white"
                  >
                    <option value="wishlist">Wishlist</option>
                    <option value="planned">Planning to Buy</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Store / Product Link (Optional)</label>
                <input
                  type="url"
                  placeholder="https://amazon.com/..."
                  value={storeUrl}
                  onChange={(e) => setStoreUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Notes / Description</label>
                <textarea
                  placeholder="Why do you want to buy this..."
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-bold shadow-lg shadow-amber-500/25"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
