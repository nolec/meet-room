import { createClient } from "@/lib/supabase/server";
import { User } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export interface AuthResult {
  user: User;
  supabase: Awaited<ReturnType<typeof createClient>>;
}

// Next.js 동적 라우트 파라미터 타입
export interface RouteParams {
  params: Record<string, string>;
}

/**
 * 간단한 인증 확인 함수
 */
export async function requireAuth(): Promise<AuthResult | null> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    return {
      user,
      supabase,
    };
  } catch (error) {
    console.error("인증 확인 오류:", error);
    return null;
  }
}

/**
 * 인증된 사용자만 허용하는 API 핸들러 래퍼
 */
export function authRequired(
  handler: (
    req: NextRequest,
    auth: AuthResult,
    context?: RouteParams
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    context?: RouteParams
  ): Promise<NextResponse> => {
    const auth = await requireAuth();

    if (!auth) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    return await handler(req, auth, context);
  };
}

/**
 * 인증된 사용자는 접근을 막는 API 핸들러 래퍼 (예: 로그인 페이지)
 */
export function authForbidden(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const auth = await requireAuth();

    if (auth) {
      return NextResponse.json(
        { error: "이미 로그인된 사용자입니다." },
        { status: 400 }
      );
    }

    return await handler(req);
  };
}
