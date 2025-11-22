import { authForbidden } from "@/lib/auth/middleware";
import { createClient } from "@/lib/supabase/server";
import { AuthResponse, RegisterRequest } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

// POST /api/auth/register - 회원가입
export const POST = authForbidden(async (req: NextRequest) => {
  try {
    const supabase = await createClient();
    const {
      email,
      password,
      name,
      age,
      gender,
      bio,
      interests,
    }: RegisterRequest = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호는 필수입니다." },
        { status: 400 }
      );
    }

    const displayName = name || email.split("@")[0];
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: displayName,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 회원가입 성공 시 프로필 생성
    if (data.user) {
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: displayName,
            age: age || null,
            gender: gender || null,
            bio: bio || null,
            interests: interests && interests.length > 0 ? interests : null,
          });

        if (profileError) {
          console.error("프로필 생성 실패:", profileError);
          // 프로필 생성 실패해도 회원가입은 성공으로 처리
        }

        // 사용자 설정도 생성
        const { error: preferencesError } = await supabase
          .from("user_preferences")
          .insert({
            user_id: data.user.id,
          });

        if (preferencesError) {
          console.error("사용자 설정 생성 실패:", preferencesError);
        }
      } catch (err) {
        console.error("프로필/설정 생성 중 오류:", err);
      }
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
