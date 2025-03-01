import { getToken } from "next-auth/jwt";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path if needed

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Updating onboarding status for:", token.sub);

    // ✅ Update onboarding status in the database
    await prisma.user.update({
      where: { id: token.sub },
      data: { isOnboarded: true },
    });

    // ✅ Force a session refresh by updating token
    const session = await getServerSession(authOptions);
    return NextResponse.json({ 
      message: "Onboarding complete", 
      user: { ...session?.user, isOnboarded: true } 
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ message: "An error occurred", error }, { status: 500 });
  }
}
