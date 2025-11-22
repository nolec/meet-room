import { getServerUser } from "@/lib/auth/server";
import HomeClient from "./HomeClient";

export default async function Home() {
  // 서버 사이드에서 사용자 정보 확인
  const user = await getServerUser();

  return <HomeClient user={user} />;
}
