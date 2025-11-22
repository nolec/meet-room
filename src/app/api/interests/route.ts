import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { InterestInsert, InterestUpdate } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

// GET /api/interests - 관심 표현 목록 조회 (받은 관심 / 보낸 관심)
export const GET = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'sent' | 'received'
    const status = searchParams.get("status");

    let query;
    if (type === "sent") {
      // 내가 보낸 관심 표현
      query = auth.supabase
        .from("interests")
        .select(
          `
          *,
          to_user:to_user_id (
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
              name
            )
          )
        `
        )
        .eq("from_user_id", auth.user.id);
    } else {
      // 내가 받은 관심 표현
      query = auth.supabase
        .from("interests")
        .select(
          `
          *,
          from_user:from_user_id (
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
              name
            )
          )
        `
        )
        .eq("to_user_id", auth.user.id);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: interests, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("관심 표현 조회 오류:", error);
      return NextResponse.json(
        { error: "관심 표현을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ interests });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

// POST /api/interests - 관심 표현하기
export const POST = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const body = await req.json();
    const { to_user_id, room_id } = body;

    if (!to_user_id || !room_id) {
      return NextResponse.json(
        { error: "대상 사용자 ID와 방 ID는 필수입니다." },
        { status: 400 }
      );
    }

    if (to_user_id === auth.user.id) {
      return NextResponse.json(
        { error: "자기 자신에게 관심 표현을 할 수 없습니다." },
        { status: 400 }
      );
    }

    // 이미 관심 표현했는지 확인
    const { data: existing } = await auth.supabase
      .from("interests")
      .select("*")
      .eq("from_user_id", auth.user.id)
      .eq("to_user_id", to_user_id)
      .eq("room_id", room_id)
      .single();

    if (existing) {
      if (existing.status === "withdrawn") {
        // 철회했던 관심 표현 다시 활성화
        const { data: interest, error } = await auth.supabase
          .from("interests")
          .update({
            status: "pending",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) {
          console.error("관심 표현 업데이트 오류:", error);
          return NextResponse.json(
            { error: "관심 표현에 실패했습니다." },
            { status: 500 }
          );
        }

        // 매칭 확인
        await checkAndCreateMatch(auth, auth.user.id, to_user_id, room_id);

        return NextResponse.json({ interest }, { status: 200 });
      }

      return NextResponse.json(
        { error: "이미 관심 표현을 했습니다." },
        { status: 400 }
      );
    }

    const interestData: InterestInsert = {
      from_user_id: auth.user.id,
      to_user_id,
      room_id,
      status: "pending",
    };

    const { data: interest, error } = await auth.supabase
      .from("interests")
      .insert(interestData)
      .select()
      .single();

    if (error) {
      console.error("관심 표현 오류:", error);
      return NextResponse.json(
        { error: "관심 표현에 실패했습니다." },
        { status: 500 }
      );
    }

    // 매칭 확인 (상대방이 나에게 이미 관심 표현했는지)
    await checkAndCreateMatch(auth, auth.user.id, to_user_id, room_id);

    return NextResponse.json({ interest }, { status: 201 });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

// 매칭 확인 및 생성 함수
async function checkAndCreateMatch(
  auth: AuthResult,
  user1Id: string,
  user2Id: string,
  roomId: string
) {
  // 상대방이 나에게 관심 표현했는지 확인
  const { data: reciprocalInterest } = await auth.supabase
    .from("interests")
    .select("*")
    .eq("from_user_id", user2Id)
    .eq("to_user_id", user1Id)
    .eq("room_id", roomId)
    .eq("status", "pending")
    .single();

  if (reciprocalInterest) {
    // 양쪽 모두 관심 표현했으므로 매칭 생성
    const { data: myInterest } = await auth.supabase
      .from("interests")
      .select("*")
      .eq("from_user_id", user1Id)
      .eq("to_user_id", user2Id)
      .eq("room_id", roomId)
      .single();

    if (myInterest) {
      // 양쪽 관심 표현 상태를 'accepted'로 업데이트
      await auth.supabase
        .from("interests")
        .update({ status: "accepted" })
        .in("id", [myInterest.id, reciprocalInterest.id]);

      // 매칭 생성
      const matchData = {
        user1_id: user1Id < user2Id ? user1Id : user2Id,
        user2_id: user1Id < user2Id ? user2Id : user1Id,
        room_id: roomId,
        interest1_id: user1Id < user2Id ? myInterest.id : reciprocalInterest.id,
        interest2_id: user1Id < user2Id ? reciprocalInterest.id : myInterest.id,
        status: "active",
      };

      await auth.supabase.from("matches").upsert(matchData, {
        onConflict: "user1_id,user2_id,room_id",
      });
    }
  }
}

