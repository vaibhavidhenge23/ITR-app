"use client";
import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, IndianRupee, FileText, Loader2, CheckCircle2, Circle } from "lucide-react";
import { useUser } from "@/lib/useUser";

function StatCard({ title, value, sub, icon: Icon, color, loading }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm">{title}</span>
        <Icon size={20} className={color} />
      </div>
      {loading
        ? <div className="h-8 w-24 bg-gray-800 animate-pulse rounded" />
        : <div className="text-2xl font-bold">{value}</div>
      }
      <div className="text-gray-500 text-xs mt-1">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useUser();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;
    const period = "2025-26";

    Promise.all([
      fetch(`/api/income?userId=${uid}`).then(r => r.json()),
      fetch(`/api/expenses?userId=${uid}`).then(r => r.json()),
      fetch(`/api/investments?userId=${uid}`).then(r => r.json()),
      fetch(`/api/tds?userId=${uid}`).then(r => r.json()),
    ]).then(([incomes, expenses, investments, tdsRecords]) => {
      const grossIncome = Array.isArray(incomes) ? incomes.reduce((s, i) => s + i.amount, 0) : 0;
      const totalExpenses = Array.isArray(expenses) ? expenses.reduce((s, e) => s + e.amount, 0) : 0;
      const deductionAmt = Array.isArray(investments) ? investments.reduce((s, i) => s + i.amount, 0) : 0;
      const stdDed = 75000;
      const totalDeductions = deductionAmt + stdDed;
      const taxableIncome = Math.max(grossIncome - totalDeductions, 0);
      const tdsPaid = Array.isArray(tdsRecords) ? tdsRecords.reduce((s, t) => s + t.tdsAmount, 0) : 0;

      // Simple new regime tax estimate
      let tax = 0;
      if (taxableIncome > 1500000) tax = 150000 + (taxableIncome - 1500000) * 0.30;
      else if (taxableIncome > 1200000) tax = 90000 + (taxableIncome - 1200000) * 0.20;
      else if (taxableIncome > 900000) tax = 45000 + (taxableIncome - 900000) * 0.15;
      else if (taxableIncome > 600000) tax = 15000 + (taxableIncome - 600000) * 0.10;
      else if (taxableIncome > 300000) tax = (taxableIncome - 300000) * 0.05;
      const cess = tax * 0.04;
      const totalTax = Math.round(tax + cess);
      const taxPayable = Math.max(totalTax - tdsPaid, 0);

      setStats({
        grossIncome, totalDeductions, totalExpenses,
        taxableIncome, totalTax, taxPayable,
        hasIncome: Array.isArray(incomes) && incomes.length > 0,
        hasInvestments: Array.isArray(investments) && investments.length > 0,
        hasTDS: Array.isArray(tdsRecords) && tdsRecords.length > 0,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const fmt = (n) => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

  const steps = [
    { label: "Account Created", done: true },
    { label: "Income Added", done: stats?.hasIncome },
    { label: "Investments Added", done: stats?.hasInvestments },
    { label: "TDS Entered", done: stats?.hasTDS },
    { label: "Tax Computed", done: !loading && stats?.totalTax > 0 },
    { label: "Report Ready", done: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        {user && <span className="text-gray-400 text-sm">Welcome, {user.name}</span>}
      </div>
      <p className="text-gray-500 text-sm mb-6">Assessment Year: 2025-26</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Gross Income" value={fmt(stats?.grossIncome)} sub="All sources" icon={TrendingUp} color="text-green-400" loading={loading} />
        <StatCard title="Total Deductions" value={fmt(stats?.totalDeductions)} sub="80C + 80D + Std Dev" icon={TrendingDown} color="text-blue-400" loading={loading} />
        <StatCard title="Taxable Income" value={fmt(stats?.taxableIncome)} sub="After deductions" icon={IndianRupee} color="text-yellow-400" loading={loading} />
        <StatCard title="Est. Tax Payable" value={fmt(stats?.taxPayable)} sub="After TDS credit (New Regime)" icon={FileText} color="text-red-400" loading={loading} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Filing Progress */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Filing Progress</h3>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                {s.done
                  ? <CheckCircle2 size={20} className="text-green-400 shrink-0" />
                  : <Circle size={20} className="text-gray-600 shrink-0" />
                }
                <span className={s.done ? "text-white" : "text-gray-500"}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold mb-4">Financial Summary</h3>
          {loading
            ? <div className="space-y-2">{[1,2,3,4].map(i => <div key={i} className="h-8 bg-gray-800 animate-pulse rounded" />)}</div>
            : (
              <div className="space-y-3">
                {[
                  { label: "Gross Income", value: fmt(stats?.grossIncome), color: "text-green-400" },
                  { label: "Business Expenses", value: fmt(stats?.totalExpenses), color: "text-orange-400" },
                  { label: "Deductions (80C/D + Std)", value: fmt(stats?.totalDeductions), color: "text-blue-400" },
                  { label: "Taxable Income", value: fmt(stats?.taxableIncome), color: "text-yellow-400" },
                  { label: "Total Tax (incl. cess)", value: fmt(stats?.totalTax), color: "text-red-400" },
                  { label: "Est. Tax Payable", value: fmt(stats?.taxPayable), color: "text-red-400 font-bold" },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-gray-800 pb-2">
                    <span className="text-gray-400">{row.label}</span>
                    <span className={row.color}>{row.value}</span>
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
