"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useUser } from "@/lib/useUser";

const CATEGORIES = ["RENT", "SALARY_PAID", "TRAVEL", "EQUIPMENT", "SOFTWARE", "MARKETING", "OTHER"];

export default function Expenses() {
  const { user } = useUser();
  const [form, setForm] = useState({ category: "RENT", description: "", amount: "", date: "" });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetch(`/api/expenses?userId=${user.id}`)
      .then(r => r.json())
      .then(data => { setList(Array.isArray(data) ? data : []); })
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), userId: user.id }),
      });
      if (res.ok) {
        const saved = await res.json();
        setList([saved, ...list]);
        setMsg("✅ Expense saved!");
        setForm({ category: "RENT", description: "", amount: "", date: "" });
      } else {
        const err = await res.json();
        setMsg(`❌ ${err.error || "Error saving"}`);
      }
    } catch { setMsg("❌ Server error"); }
    setLoading(false);
  }

  const total = list.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Business Expenses</h2>
      <p className="text-gray-500 text-sm mb-6">ITR-4 ke liye — business expenses deduction milti hai</p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Add Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <input type="text" placeholder="Office rent / Laptop purchase"
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount (₹)</label>
              <input type="number" placeholder="25000"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add Expense
            </button>
            {msg && <p className="text-center text-sm">{msg}</p>}
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">Expenses</h3>
            {total > 0 && <span className="text-red-400 font-bold text-sm">Total: ₹{total.toLocaleString()}</span>}
          </div>
          {fetching
            ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-500" /></div>
            : list.length === 0
              ? <p className="text-gray-500 text-sm">No expenses added yet.</p>
              : list.map((item, i) => (
                <div key={item.id || i} className="border-b border-gray-800 py-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">{item.description}</span>
                    <span className="text-red-400 text-sm">₹{item.amount.toLocaleString()}</span>
                  </div>
                  <span className="text-xs text-gray-500">{item.category} · {new Date(item.date).toLocaleDateString("en-IN")}</span>
                </div>
              ))}
        </div>
      </div>
    </div>
  );
}
