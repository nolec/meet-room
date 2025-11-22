import { authForbidden } from "@/lib/auth/middleware";
import { createClient } from "@/lib/supabase/server";
import { AuthResponse, LoginRequest } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/login - 로그인
export const POST = authForbidden(async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const { email, password }: LoginRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const response: AuthResponse = {
      user: {
        id: data.user!.id,
        email: data.user!.email!,
        name: data.user!.user_metadata?.name,
      },
      session: {
        access_token: data.session!.access_token,
        refresh_token: data.session!.refresh_token,
        expires_at: data.session!.expires_at!,
      },
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
