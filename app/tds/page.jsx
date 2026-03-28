"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useUser } from "@/lib/useUser";

export default function TDS() {
  const { user } = useUser();
  const [form, setForm] = useState({ deductor: "", tan: "", totalIncome: "", tdsAmount: "", period: "2025-26", form: "16" });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetch(`/api/tds?userId=${user.id}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(() => { })
      .finally(() => setFetching(false));
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/tds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalIncome: parseFloat(form.totalIncome),
          tdsAmount: parseFloat(form.tdsAmount),
          userId: user.id,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setList([saved, ...list]);
        setMsg("✅ TDS record saved!");
        setForm({ deductor: "", tan: "", totalIncome: "", tdsAmount: "", period: "2025-26", form: "16" });
      } else {
        const err = await res.json();
        setMsg(`❌ ${err.error || "Error saving"}`);
      }
    } catch { setMsg("❌ Server error"); }
    setLoading(false);
  }

  const totalTDS = list.reduce((s, r) => s + r.tdsAmount, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">TDS Records</h2>
      <p className="text-gray-500 text-sm mb-6">Enter data from Form 16 (employer) or Form 26AS </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Add TDS Entry</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Deductor Name</label>
              <input type="text" placeholder="TCS Limited"
                value={form.deductor} onChange={e => setForm({ ...form, deductor: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">TAN Number</label>
              <input type="text" placeholder="MUMT12345E"
                value={form.tan} onChange={e => setForm({ ...form, tan: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Total Income Shown (₹)</label>
              <input type="number" placeholder="1200000"
                value={form.totalIncome} onChange={e => setForm({ ...form, totalIncome: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">TDS Deducted (₹)</label>
              <input type="number" placeholder="120000"
                value={form.tdsAmount} onChange={e => setForm({ ...form, tdsAmount: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Form Type</label>
              <select value={form.form} onChange={e => setForm({ ...form, form: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                <option value="16">Form 16 (Salary)</option>
                <option value="16A">Form 16A (Other)</option>
                <option value="26AS">Form 26AS</option>
              </select>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Save TDS Record
            </button>
            {msg && <p className="text-center text-sm">{msg}</p>}
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold">TDS Records</h3>
            {totalTDS > 0 && <span className="text-blue-400 font-bold text-sm">Total TDS: ₹{totalTDS.toLocaleString()}</span>}
          </div>
          {fetching
            ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-500" /></div>
            : list.length === 0
              ? <p className="text-gray-500 text-sm">No TDS record added yet.</p>
              : list.map((r, i) => (
                <div key={r.id || i} className="border-b border-gray-800 py-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm">{r.deductor}</span>
                    <span className="text-blue-400 text-sm">₹{r.tdsAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-gray-500">Form {r.form} · Income: ₹{r.totalIncome.toLocaleString()}</div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}
