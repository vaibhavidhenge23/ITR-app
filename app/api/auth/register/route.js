import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hashPassword(password) {
  // Simple but functional hash using built-in TextEncoder
  let hash = 0;
  const salt = "itr_app_salt_2026";
  const str = password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export async function POST(req) {
  try {
    const { name, email, phone, password, pan, dob } = await req.json();

    if (!email || !phone || !password || !name || !pan || !dob) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.userProfile.findFirst({
      where: { email }
    });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const existingPan = await prisma.userProfile.findUnique({ where: { pan: pan.toUpperCase() } });
    if (existingPan) {
      return NextResponse.json({ error: "PAN already registered" }, { status: 409 });
    }

    const hashed = hashPassword(password);
    const user = await prisma.userProfile.create({
      data: {
        name,
        email,
        phone,
        pan: pan.toUpperCase(),
        dob: new Date(dob),
        password: hashed,
      }
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
    }, { status: 201 });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
