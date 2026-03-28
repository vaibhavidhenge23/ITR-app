import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const incomes = await prisma.income.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(incomes);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const income = await prisma.income.create({
      data: { type: body.type, source: body.source, amount: body.amount, period: body.period, notes: body.notes || null, userId: body.userId },
    });
    return NextResponse.json(income, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
