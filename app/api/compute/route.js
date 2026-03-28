import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calcNewRegime, calcOldRegime, addCess, calcDeductions } from "@/lib/taxEngine";

export async function POST(req) {
  try {
    const { userId, period, regime } = await req.json();
    const uId = userId;

    // Saara data fetch karo
    const incomes     = await prisma.income.findMany({ where: { userId: uId, period } });
    const investments = await prisma.investment.findMany({ where: { userId: uId, period } });
    const tdsRecords  = await prisma.tDSRecord.findMany({ where: { userId: uId, period } });

    // Gross income
    const grossIncome = incomes.reduce((s, i) => s + i.amount, 0);

    // Deductions
    const c80 = investments.filter((i) => i.section === "80C").reduce((s, i) => s + i.amount, 0);
    const d80 = investments.filter((i) => i.section === "80D").reduce((s, i) => s + i.amount, 0);
    const hra = investments.filter((i) => i.section === "HRA").reduce((s, i) => s + i.amount, 0);
    const deductions = calcDeductions({ section80C: c80, section80D: d80, hra });

    // Taxable income
    const taxableIncome = Math.max(
      grossIncome - (regime === "OLD" ? deductions.total : deductions.standardDeduction), 0
    );

    // Tax
    const baseTax   = regime === "OLD" ? calcOldRegime(taxableIncome) : calcNewRegime(taxableIncome);
    const totalTax  = addCess(baseTax);
    const cess      = totalTax - baseTax;
    const tdsPaid   = tdsRecords.reduce((s, t) => s + t.tdsAmount, 0);
    const taxPayable = totalTax - tdsPaid;

    // Save computation
    const computation = await prisma.taxComputation.create({
      data: {
        period, grossIncome, standardDeduction: 75000,
        totalDeductions: deductions.total, taxableIncome,
        taxAmount: baseTax, cess, totalTax, tdsPaid, taxPayable,
        regime: regime || "NEW", userId: uId,
      },
    });

    return NextResponse.json(computation);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
