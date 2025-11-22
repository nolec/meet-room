import { redirectIfAuthenticated } from "@/lib/auth/server";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
  // 서버 사이드에서 이미 로그인된 사용자 리다이렉트
  await redirectIfAuthenticated();

  return <LoginClient />;
}
