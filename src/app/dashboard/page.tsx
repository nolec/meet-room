import { requireAuth } from "@/lib/auth/server";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // 서버 사이드에서 인증 확인 및 리다이렉트
  const user = await requireAuth();

  return <DashboardClient user={user} />;
}
