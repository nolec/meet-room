import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/logout - 로그아웃
export const POST = authRequired(
  async (_req: NextRequest, auth: AuthResult) => {
    try {
      const { error } = await auth.supabase.auth.signOut();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
);
