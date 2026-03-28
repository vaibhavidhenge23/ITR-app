"use client";
import { useState, useEffect } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useUser } from "@/lib/useUser";

const SECTIONS = [
  { section: "80C", types: ["LIC Premium", "PPF", "ELSS", "EPF", "Home Loan Principal", "NSC", "Sukanya Samriddhi"], max: 150000 },
  { section: "80D", types: ["Health Insurance Self", "Health Insurance Parents"], max: 25000 },
  { section: "80G", types: ["PM Relief Fund", "Charity Donation"], max: null },
  { section: "HRA", types: ["House Rent Allowance"], max: null },
  { section: "80E", types: ["Education Loan Interest"], max: null },
];

export default function Investments() {
  const { user } = useUser();
  const [form, setForm] = useState({ section: "80C", type: "LIC Premium", amount: "", period: "2025-26" });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetch(`/api/investments?userId=${user.id}`)
      .then(r => r.json())
      .then(data => setList(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  function handleSectionChange(section) {
    const types = SECTIONS.find(s => s.section === section).types;
    setForm({ ...form, section, type: types[0] });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    const sec = SECTIONS.find(s => s.section === form.section);
    setLoading(true); setMsg("");
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount), maxLimit: sec.max || 0, userId: user.id }),
      });
      if (res.ok) {
        const saved = await res.json();
        setList([saved, ...list]);
        setMsg("✅ Investment saved!");
        setForm({ section: "80C", type: "LIC Premium", amount: "", period: "2025-26" });
      } else {
        const err = await res.json();
        setMsg(`❌ ${err.error || "Error saving"}`);
      }
    } catch { setMsg("❌ Server error"); }
    setLoading(false);
  }

  const totals = SECTIONS.map(s => ({
    section: s.section,
    total: list.filter(i => i.section === s.section).reduce((sum, i) => sum + i.amount, 0),
    max: s.max,
  }));

  const currentTypes = SECTIONS.find(s => s.section === form.section)?.types || [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Investments & Deductions</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Add Investment / Deduction</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Section</label>
              <select value={form.section} onChange={e => handleSectionChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                {SECTIONS.map(s => (
                  <option key={s.section} value={s.section}>
                    {s.section} {s.max ? `(Max ₹${s.max.toLocaleString()})` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500">
                {currentTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Amount (₹)</label>
              <input type="number" placeholder="150000"
                value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />} Add
            </button>
            {msg && <p className="text-center text-sm">{msg}</p>}
          </form>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Deduction Summary</h3>
          {fetching
            ? <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-500" /></div>
            : (
              <div className="space-y-3">
                {totals.map(t => (
                  <div key={t.section} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">Section {t.section}</span>
                      <span className={t.max && t.total > t.max ? "text-red-400" : "text-green-400"}>
                        ₹{t.total.toLocaleString()}{t.max ? ` / ₹${t.max.toLocaleString()}` : ""}
                      </span>
                    </div>
                    {t.max && (
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${Math.min((t.total / t.max) * 100, 100)}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          }
          <div className="mt-4 pt-4 border-t border-gray-800 flex justify-between font-bold">
            <span>Total Deductions</span>
            <span className="text-blue-400">₹{list.reduce((s, i) => s + i.amount, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
