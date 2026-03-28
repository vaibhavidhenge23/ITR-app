"use client";
import { useState, useEffect, useRef } from "react";
import { FileText, Download, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useUser } from "@/lib/useUser";

export default function Report() {
  const { user } = useUser();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.id;

    Promise.all([
      fetch(`/api/income?userId=${uid}`).then(r => r.json()),
      fetch(`/api/expenses?userId=${uid}`).then(r => r.json()),
      fetch(`/api/investments?userId=${uid}`).then(r => r.json()),
      fetch(`/api/tds?userId=${uid}`).then(r => r.json()),
    ]).then(([incomes, expenses, investments, tdsRecords]) => {
      const inc = Array.isArray(incomes) ? incomes : [];
      const exp = Array.isArray(expenses) ? expenses : [];
      const inv = Array.isArray(investments) ? investments : [];
      const tds = Array.isArray(tdsRecords) ? tdsRecords : [];

      const grossIncome = inc.reduce((s, i) => s + i.amount, 0);
      const stdDeduction = 75000;
      const c80 = Math.min(inv.filter(i => i.section === "80C").reduce((s, i) => s + i.amount, 0), 150000);
      const d80 = Math.min(inv.filter(i => i.section === "80D").reduce((s, i) => s + i.amount, 0), 25000);
      const hra = inv.filter(i => i.section === "HRA").reduce((s, i) => s + i.amount, 0);
      const e80 = inv.filter(i => i.section === "80E").reduce((s, i) => s + i.amount, 0);
      const g80 = inv.filter(i => i.section === "80G").reduce((s, i) => s + i.amount, 0);
      const totalDeductions = stdDeduction + c80 + d80 + hra + e80 + g80;
      const taxableIncome = Math.max(grossIncome - totalDeductions, 0);
      const tdsPaid = tds.reduce((s, t) => s + t.tdsAmount, 0);
      const totalExpenses = exp.reduce((s, e) => s + e.amount, 0);

      // New regime slabs (FY 2025-26)
      let baseTax = 0; let rem = taxableIncome;
      const slabs = [
        { upto: 300000, rate: 0 }, { upto: 700000, rate: 0.05 },
        { upto: 1000000, rate: 0.10 }, { upto: 1200000, rate: 0.15 },
        { upto: 1500000, rate: 0.20 }, { upto: Infinity, rate: 0.30 },
      ];
      let prev = 0;
      for (const s of slabs) {
        if (taxableIncome <= prev) break;
        baseTax += (Math.min(taxableIncome, s.upto) - prev) * s.rate;
        prev = s.upto;
      }
      const cess = baseTax * 0.04;
      const totalTax = Math.round(baseTax + cess);
      const taxPayable = Math.max(totalTax - tdsPaid, 0);
      const refund = Math.max(tdsPaid - totalTax, 0);

      const hasIncome = inc.length > 0;
      const hasBusinessIncome = inc.some(i => i.type === "BUSINESS");

      setData({
        user,
        incomes: inc,
        expenses: exp,
        investments: inv,
        tdsRecords: tds,
        grossIncome, stdDeduction, c80, d80, hra, e80, g80,
        totalDeductions, taxableIncome, baseTax, cess, totalTax,
        tdsPaid, taxPayable, refund, totalExpenses,
        itrForm: hasBusinessIncome ? "ITR-4" : "ITR-1",
        hasIncome,
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  function handleDownload() {
    if (!printRef.current) return;
    setDownloading(true);

    const printContent = printRef.current.innerHTML;
    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>ITR Summary Report - ${user?.name || "User"}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; color: #111; background: #fff; padding: 32px; }
          h1 { font-size: 22px; font-weight: bold; color: #1d4ed8; margin-bottom: 4px; }
          h2 { font-size: 16px; font-weight: bold; margin-bottom: 12px; color: #111; margin-top: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 6px; }
          .subtitle { color: #6b7280; font-size: 13px; margin-bottom: 24px; }
          .header-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .badge { background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 999px; font-size: 13px; font-weight: bold; }
          table { width: 100%; border-collapse: collapse; }
          td, th { padding: 8px 12px; font-size: 13px; }
          tr:nth-child(even) { background: #f9fafb; }
          td:last-child { text-align: right; font-weight: 500; }
          .section-label { color: #6b7280; }
          .total-row td { font-weight: bold; font-size: 14px; border-top: 2px solid #e5e7eb; }
          .green { color: #16a34a; }
          .red { color: #dc2626; }
          .blue { color: #2563eb; }
          .sumbox { background: #f3f4f6; border-radius: 8px; padding: 16px; margin-top: 16px; }
          .sumbox .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          .sumbox .row:last-child { border-bottom: none; font-weight: bold; font-size: 14px; }
          .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>${printContent}</body>
      </html>
    `);
    win.document.close();
    setTimeout(() => {
      win.print();
      setDownloading(false);
    }, 600);
  }

  const fmt = n => `₹${Math.round(n || 0).toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-blue-400" size={32} />
        <span className="ml-3 text-gray-400">Loading your tax data...</span>
      </div>
    );
  }

  if (!data?.hasIncome) {
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-2">ITR Summary Report</h2>
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-5 flex items-start gap-3 mt-6">
          <AlertCircle className="text-yellow-400 shrink-0 mt-0.5" size={22} />
          <div>
            <div className="font-semibold text-yellow-400 mb-1">No data found</div>
            <div className="text-gray-400 text-sm">Please add your income, investments, and TDS records first. Then return here to generate your report.</div>
          </div>
        </div>
      </div>
    );
  }

  const summary = [
    { label: "Gross Total Income",           value: fmt(data.grossIncome),       cls: "" },
    { label: "Less: Standard Deduction",     value: `- ${fmt(data.stdDeduction)}`, cls: "text-green-400" },
    { label: "Less: Section 80C",            value: `- ${fmt(data.c80)}`,          cls: "text-green-400" },
    { label: "Less: Section 80D",            value: `- ${fmt(data.d80)}`,          cls: "text-green-400" },
    data.hra > 0 && { label: "Less: HRA Exemption",   value: `- ${fmt(data.hra)}`,   cls: "text-green-400" },
    data.e80 > 0 && { label: "Less: Section 80E",     value: `- ${fmt(data.e80)}`,   cls: "text-green-400" },
    data.g80 > 0 && { label: "Less: Section 80G",     value: `- ${fmt(data.g80)}`,   cls: "text-green-400" },
    { label: "Taxable Income",               value: fmt(data.taxableIncome),      cls: "text-yellow-400 font-bold" },
    { label: "Income Tax (New Regime)",      value: fmt(data.baseTax),            cls: "" },
    { label: "Health & Education Cess (4%)", value: fmt(data.cess),               cls: "" },
    { label: "Total Tax Liability",          value: fmt(data.totalTax),           cls: "text-white font-bold" },
    { label: "TDS Already Deducted",         value: `- ${fmt(data.tdsPaid)}`,      cls: "text-green-400" },
  ].filter(Boolean);

  const isRefund = data.refund > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-2xl font-bold">ITR Summary Report</h2>
        <span className="bg-blue-900 text-blue-400 px-3 py-1 rounded-full text-sm font-bold">{data.itrForm}</span>
      </div>
      <p className="text-gray-500 text-sm mb-6">Assessment Year 2025-26 · New Tax Regime</p>

      <div className="max-w-2xl space-y-4">
        {/* Status */}
        <div className={`border rounded-xl p-4 flex items-center gap-3
          ${data.hasIncome ? "bg-green-900/30 border-green-800" : "bg-yellow-900/30 border-yellow-800"}`}>
          <CheckCircle className="text-green-400 shrink-0" size={22} />
          <div>
            <div className="font-semibold text-green-400">Report Generated</div>
            <div className="text-gray-400 text-sm">Based on your saved income, investments & TDS data</div>
          </div>
        </div>

        {/* Tax Computation */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <FileText size={18} className="text-blue-400" /> Tax Computation
          </h3>
          <div className="space-y-2">
            {summary.map(({ label, value, cls }, i) => (
              <div key={i}
                className={`flex justify-between py-2 text-sm border-b border-gray-800 last:border-0`}>
                <span className="text-gray-400">{label}</span>
                <span className={cls || "text-white"}>{value}</span>
              </div>
            ))}
            {/* Final payable / refund row */}
            <div className="flex justify-between py-3 border-t border-gray-700 font-bold text-base mt-1">
              <span>{isRefund ? "Refund Receivable" : "Net Tax Payable"}</span>
              <span className={isRefund ? "text-green-400" : "text-red-400"}>
                {isRefund ? fmt(data.refund) : fmt(data.taxPayable)}
              </span>
            </div>
          </div>
        </div>

        {/* Income Breakdown */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-3">Income Sources</h3>
          {data.incomes.map((inc, i) => (
            <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-800 last:border-0">
              <span className="text-gray-400">{inc.source} <span className="text-xs text-gray-600">({inc.type})</span></span>
              <span className="text-green-400">{fmt(inc.amount)}</span>
            </div>
          ))}
        </div>

        {/* ITR Form & Download */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-center">
          <div>
            <div className="font-semibold">Applicable ITR Form</div>
            <div className="text-gray-500 text-sm">Based on your income sources</div>
          </div>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-bold
              ${data.itrForm === "ITR-1" ? "bg-blue-900 text-blue-400" : "bg-gray-800 text-gray-400"}`}>ITR-1</span>
            <span className={`px-3 py-1 rounded-full text-sm font-bold
              ${data.itrForm === "ITR-4" ? "bg-blue-900 text-blue-400" : "bg-gray-800 text-gray-400"}`}>ITR-4</span>
          </div>
        </div>

        {/* Download Button */}
        <button onClick={handleDownload} disabled={downloading}
          className="w-full bg-blue-500 text-white font-bold py-3 rounded-xl hover:bg-blue-400 transition flex items-center justify-center gap-2 disabled:opacity-50">
          {downloading
            ? <><Loader2 size={20} className="animate-spin" /> Generating PDF...</>
            : <><Download size={20} /> Download ITR Summary (PDF)</>
          }
        </button>

        <p className="text-gray-500 text-xs text-center">
          Use this summary on incometax.gov.in to file your ITR
        </p>
      </div>

      {/* Hidden printable section */}
      <div style={{ display: "none" }}>
        <div ref={printRef}>
          <div className="header-row">
            <div>
              <h1>📋 ITR Summary Report</h1>
              <div className="subtitle">Assessment Year 2025-26 · New Tax Regime · {data.itrForm}</div>
              <div className="subtitle">
                Name: <strong>{data.user?.name}</strong> &nbsp;|&nbsp;
                Generated: {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            </div>
            <div className="badge">{data.itrForm}</div>
          </div>

          <h2>Tax Computation</h2>
          <table>
            <tbody>
              <tr><td className="section-label">Gross Total Income</td><td>{fmt(data.grossIncome)}</td></tr>
              <tr><td className="section-label">Less: Standard Deduction</td><td className="green">- {fmt(data.stdDeduction)}</td></tr>
              {data.c80 > 0 && <tr><td className="section-label">Less: Section 80C</td><td className="green">- {fmt(data.c80)}</td></tr>}
              {data.d80 > 0 && <tr><td className="section-label">Less: Section 80D</td><td className="green">- {fmt(data.d80)}</td></tr>}
              {data.hra > 0 && <tr><td className="section-label">Less: HRA Exemption</td><td className="green">- {fmt(data.hra)}</td></tr>}
              {data.e80 > 0 && <tr><td className="section-label">Less: Section 80E</td><td className="green">- {fmt(data.e80)}</td></tr>}
              {data.g80 > 0 && <tr><td className="section-label">Less: Section 80G</td><td className="green">- {fmt(data.g80)}</td></tr>}
              <tr className="total-row"><td>Taxable Income</td><td>{fmt(data.taxableIncome)}</td></tr>
              <tr><td className="section-label">Income Tax (New Regime Slabs)</td><td>{fmt(data.baseTax)}</td></tr>
              <tr><td className="section-label">Health & Education Cess (4%)</td><td>{fmt(data.cess)}</td></tr>
              <tr><td className="section-label">Total Tax Liability</td><td>{fmt(data.totalTax)}</td></tr>
              <tr><td className="section-label">Less: TDS Already Deducted</td><td className="green">- {fmt(data.tdsPaid)}</td></tr>
              <tr className="total-row">
                <td>{isRefund ? "Refund Receivable" : "Net Tax Payable"}</td>
                <td className={isRefund ? "green" : "red"}>{isRefund ? fmt(data.refund) : fmt(data.taxPayable)}</td>
              </tr>
            </tbody>
          </table>

          <h2>Income Sources</h2>
          <table>
            <thead><tr><th style={{textAlign:"left"}}>Source</th><th style={{textAlign:"left"}}>Type</th><th style={{textAlign:"right"}}>Amount</th></tr></thead>
            <tbody>
              {data.incomes.map((inc, i) => (
                <tr key={i}>
                  <td>{inc.source}</td>
                  <td className="section-label">{inc.type}</td>
                  <td className="green">{fmt(inc.amount)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>Total</td><td></td><td>{fmt(data.grossIncome)}</td>
              </tr>
            </tbody>
          </table>

          {data.investments.length > 0 && <>
            <h2>Deductions & Investments</h2>
            <table>
              <thead><tr><th style={{textAlign:"left"}}>Section</th><th style={{textAlign:"left"}}>Type</th><th style={{textAlign:"right"}}>Amount</th></tr></thead>
              <tbody>
                {data.investments.map((inv, i) => (
                  <tr key={i}>
                    <td>{inv.section}</td>
                    <td className="section-label">{inv.type}</td>
                    <td className="blue">{fmt(inv.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>}

          {data.tdsRecords.length > 0 && <>
            <h2>TDS Records</h2>
            <table>
              <thead><tr><th style={{textAlign:"left"}}>Deductor</th><th style={{textAlign:"left"}}>Form</th><th style={{textAlign:"right"}}>TDS Amount</th></tr></thead>
              <tbody>
                {data.tdsRecords.map((t, i) => (
                  <tr key={i}>
                    <td>{t.deductor}</td>
                    <td className="section-label">Form {t.form}</td>
                    <td className="green">{fmt(t.tdsAmount)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>Total TDS</td><td></td><td>{fmt(data.tdsPaid)}</td>
                </tr>
              </tbody>
            </table>
          </>}

          <div className="footer">
            Generated by ITR Auto · For filing on incometax.gov.in · Assessment Year 2025-26
          </div>
        </div>
      </div>
    </div>
  );
}
