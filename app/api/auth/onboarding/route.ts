import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // console.log(" Token in onboarding API:", token); // Debug log

    if (!token) {
      return NextResponse.json({ error: "Unauthorized: No token found" }, { status: 401 });
    }

    // Update user onboarding status
    await prisma.user.update({
      where: { id: token.sub }, // Use `sub` for user ID
      data: { isOnboarded: true },
    });

    return NextResponse.json({ message: "Onboarding complete", redirect: "/dashboard" });
  } catch (error) {
    console.error("❌ Onboarding error:", error);
    return NextResponse.json({ message: "An error occurred", error }, { status: 500 });
  }
}
