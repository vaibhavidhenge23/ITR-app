import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const records = await prisma.tDSRecord.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    return NextResponse.json(records);
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const record = await prisma.tDSRecord.create({
      data: { deductor: body.deductor, tan: body.tan || null, totalIncome: body.totalIncome, tdsAmount: body.tdsAmount, period: body.period, form: body.form, userId: body.userId },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
