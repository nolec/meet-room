import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

/**
 * 서버 사이드에서 인증 상태를 확인하고 리다이렉트하는 함수
 */
export async function requireAuth() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return user;
}

/**
 * 서버 사이드에서 이미 로그인된 사용자를 리다이렉트하는 함수
 */
export async function redirectIfAuthenticated(
  redirectTo: string = "/dashboard"
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect(redirectTo);
  }
}

/**
 * 서버 사이드에서 인증 상태를 확인하는 함수 (리다이렉트 없음)
 */
export async function getServerUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user || null;
}
