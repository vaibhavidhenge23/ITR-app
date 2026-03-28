import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const investments = await prisma.investment.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(investments);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const investment = await prisma.investment.create({
      data: { section: body.section, type: body.type, amount: body.amount, maxLimit: body.maxLimit, period: body.period, userId: body.userId },
    });
    return NextResponse.json(investment, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
