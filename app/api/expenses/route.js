import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const expenses = await prisma.expense.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(expenses);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const expense = await prisma.expense.create({
      data: { category: body.category, description: body.description, amount: body.amount, date: new Date(body.date), userId: body.userId },
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
