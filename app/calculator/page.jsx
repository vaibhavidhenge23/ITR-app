"use client";
import { useState } from "react";

// New regime slabs (FY 2025-26)
function calcNewRegime(income) {
  const slabs = [
    { limit: 300000,  rate: 0   },
    { limit: 700000,  rate: 0.05 },
    { limit: 1000000, rate: 0.10 },
    { limit: 1200000, rate: 0.15 },
    { limit: 1500000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0, prev = 0;
  for (const slab of slabs) {
    if (income <= prev) break;
    tax += (Math.min(income, slab.limit) - prev) * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

// Old regime slabs
function calcOldRegime(income) {
  const slabs = [
    { limit: 250000,  rate: 0    },
    { limit: 500000,  rate: 0.05 },
    { limit: 1000000, rate: 0.20 },
    { limit: Infinity, rate: 0.30 },
  ];
  let tax = 0, prev = 0;
  for (const slab of slabs) {
    if (income <= prev) break;
    tax += (Math.min(income, slab.limit) - prev) * slab.rate;
    prev = slab.limit;
  }
  return tax;
}

export default function Calculator() {
  const [inputs, setInputs] = useState({
    grossIncome: "", section80C: "", section80D: "", hra: "", otherDeductions: "", tds: "",
  });
  const [result, setResult] = useState(null);

  function calculate() {
    const gross    = parseFloat(inputs.grossIncome)    || 0;
    const c80      = Math.min(parseFloat(inputs.section80C) || 0, 150000); // Max 1.5L
    const d80      = Math.min(parseFloat(inputs.section80D) || 0, 25000);  // Max 25K
    const hra      = parseFloat(inputs.hra)            || 0;
    const other    = parseFloat(inputs.otherDeductions)|| 0;
    const tds      = parseFloat(inputs.tds)            || 0;
    const stdDeduction = 75000; // Standard deduction FY25-26

    // Old regime taxable income
    const oldTaxable = Math.max(gross - stdDeduction - c80 - d80 - hra - other, 0);
    const oldTax     = calcOldRegime(oldTaxable);
    const oldCess    = oldTax * 0.04;
    const oldTotal   = oldTax + oldCess;

    // New regime taxable income (only std deduction)
    const newTaxable = Math.max(gross - stdDeduction, 0);
    const newTax     = calcNewRegime(newTaxable);
    const newCess    = newTax * 0.04;
    const newTotal   = newTax + newCess;

    setResult({
      oldRegime: { taxable: oldTaxable, tax: oldTax, cess: oldCess, total: oldTotal, payable: oldTotal - tds },
      newRegime: { taxable: newTaxable, tax: newTax, cess: newCess, total: newTotal, payable: newTotal - tds },
      better: oldTotal < newTotal ? "OLD" : "NEW",
      savings: Math.abs(oldTotal - newTotal),
    });
  }

  const fields = [
    { key: "grossIncome",     label: "Gross Annual Income (₹)",  placeholder: "1200000" },
    { key: "section80C",      label: "80C Investments (₹)",       placeholder: "150000 (max)" },
    { key: "section80D",      label: "80D Health Insurance (₹)",  placeholder: "25000 (max)" },
    { key: "hra",             label: "HRA Exemption (₹)",         placeholder: "100000" },
    { key: "otherDeductions", label: "Other Deductions (₹)",      placeholder: "0" },
    { key: "tds",             label: "TDS Already Paid (₹)",      placeholder: "80000" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Tax Calculator</h2>
      <p className="text-gray-500 text-sm mb-6">Old vs New regime compare karo — best option choose karo</p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input form */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h3 className="font-semibold mb-4">Enter Details</h3>
          <div className="space-y-3">
            {fields.map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="block text-sm text-gray-400 mb-1">{label}</label>
                <input type="number" placeholder={placeholder}
                  value={inputs[key]}
                  onChange={(e) => setInputs({ ...inputs, [key]: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
              </div>
            ))}
            <button onClick={calculate}
              className="w-full bg-blue-500 text-white font-bold py-2 rounded-lg hover:bg-blue-400 transition mt-2">
              Calculate Tax
            </button>
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="space-y-4">
            {/* Best regime banner */}
            <div className={`rounded-xl p-4 text-center font-bold
              ${result.better === "NEW" ? "bg-green-900 text-green-400" : "bg-blue-900 text-blue-400"}`}>
              ✅ {result.better} REGIME better hai — Save ₹{Math.round(result.savings).toLocaleString()}
            </div>

            {/* Old regime */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-blue-400">Old Regime</h3>
              {[
                ["Taxable Income", result.oldRegime.taxable],
                ["Income Tax",     result.oldRegime.tax],
                ["Health & Ed Cess (4%)", result.oldRegime.cess],
                ["Total Tax",      result.oldRegime.total],
                ["TDS Credit",     parseFloat(inputs.tds) || 0],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-800">
                  <span className="text-gray-400">{label}</span>
                  <span>₹{Math.round(val).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2">
                <span>Net Payable / Refund</span>
                <span className={result.oldRegime.payable > 0 ? "text-red-400" : "text-green-400"}>
                  {result.oldRegime.payable > 0 ? "Pay" : "Refund"} ₹{Math.abs(Math.round(result.oldRegime.payable)).toLocaleString()}
                </span>
              </div>
            </div>

            {/* New regime */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-green-400">New Regime</h3>
              {[
                ["Taxable Income", result.newRegime.taxable],
                ["Income Tax",     result.newRegime.tax],
                ["Health & Ed Cess (4%)", result.newRegime.cess],
                ["Total Tax",      result.newRegime.total],
                ["TDS Credit",     parseFloat(inputs.tds) || 0],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-sm py-1 border-b border-gray-800">
                  <span className="text-gray-400">{label}</span>
                  <span>₹{Math.round(val).toLocaleString()}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold mt-2">
                <span>Net Payable / Refund</span>
                <span className={result.newRegime.payable > 0 ? "text-red-400" : "text-green-400"}>
                  {result.newRegime.payable > 0 ? "Pay" : "Refund"} ₹{Math.abs(Math.round(result.newRegime.payable)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
