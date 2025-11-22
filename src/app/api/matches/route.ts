import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { NextRequest, NextResponse } from "next/server";

// GET /api/matches - 매칭 목록 조회
export const GET = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { data: matches, error } = await auth.supabase
      .from("matches")
      .select(
        `
        *,
        user1:user1_id (
          id,
          name,
          avatar_url,
          bio
        ),
        user2:user2_id (
          id,
          name,
          avatar_url,
          bio
        ),
        rooms:room_id (
          id,
          name,
          places:place_id (
            id,
            name,
            address
          )
        )
      `
      )
      .or(`user1_id.eq.${auth.user.id},user2_id.eq.${auth.user.id}`)
      .eq("status", "active")
      .order("matched_at", { ascending: false });

    if (error) {
      console.error("매칭 목록 조회 오류:", error);
      return NextResponse.json(
        { error: "매칭 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    // 상대방 정보만 반환
    const matchesWithPartner = matches.map((match) => {
      const partner =
        match.user1_id === auth.user.id ? match.user2 : match.user1;
      return {
        id: match.id,
        partner,
        room: match.rooms,
        matched_at: match.matched_at,
      };
    });

    return NextResponse.json({ matches: matchesWithPartner });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

