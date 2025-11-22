import { redirectIfAuthenticated } from "@/lib/auth/server";
import RegisterClient from "./RegisterClient";

export default async function RegisterPage() {
  // 서버 사이드에서 이미 로그인된 사용자 리다이렉트
  await redirectIfAuthenticated();

  return <RegisterClient />;
}
