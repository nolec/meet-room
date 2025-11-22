import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { InterestUpdate } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/lib/auth/middleware";

// PUT /api/interests/[id] - 관심 표현 응답 (수락/거절)
export const PUT = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const interestId = context?.params?.id;

      if (!interestId) {
        return NextResponse.json(
          { error: "관심 표현 ID가 필요합니다." },
          { status: 400 }
        );
      }

      const body = await req.json();
      const { status } = body;

      if (!status || !["accepted", "rejected"].includes(status)) {
        return NextResponse.json(
          { error: "유효하지 않은 상태입니다. (accepted 또는 rejected)" },
          { status: 400 }
        );
      }

      // 내가 받은 관심 표현인지 확인
      const { data: interest, error: fetchError } = await auth.supabase
        .from("interests")
        .select("*")
        .eq("id", interestId)
        .eq("to_user_id", auth.user.id)
        .single();

      if (fetchError || !interest) {
        return NextResponse.json(
          { error: "관심 표현을 찾을 수 없거나 권한이 없습니다." },
          { status: 404 }
        );
      }

      if (interest.status !== "pending") {
        return NextResponse.json(
          { error: "이미 처리된 관심 표현입니다." },
          { status: 400 }
        );
      }

      const updateData: InterestUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      const { data: updatedInterest, error } = await auth.supabase
        .from("interests")
        .update(updateData)
        .eq("id", interestId)
        .select()
        .single();

      if (error) {
        console.error("관심 표현 업데이트 오류:", error);
        return NextResponse.json(
          { error: "관심 표현 업데이트에 실패했습니다." },
          { status: 500 }
        );
      }

      // 수락한 경우 매칭 확인
      if (status === "accepted") {
        const { data: myInterest } = await auth.supabase
          .from("interests")
          .select("*")
          .eq("from_user_id", auth.user.id)
          .eq("to_user_id", interest.from_user_id)
          .eq("room_id", interest.room_id)
          .single();

        if (myInterest && myInterest.status === "pending") {
          // 내가 보낸 관심 표현도 수락 처리
          await auth.supabase
            .from("interests")
            .update({ status: "accepted" })
            .eq("id", myInterest.id);

          // 매칭 생성
          const matchData = {
            user1_id:
              auth.user.id < interest.from_user_id
                ? auth.user.id
                : interest.from_user_id,
            user2_id:
              auth.user.id < interest.from_user_id
                ? interest.from_user_id
                : auth.user.id,
            room_id: interest.room_id,
            interest1_id:
              auth.user.id < interest.from_user_id
                ? myInterest.id
                : interest.id,
            interest2_id:
              auth.user.id < interest.from_user_id
                ? interest.id
                : myInterest.id,
            status: "active",
          };

          await auth.supabase.from("matches").upsert(matchData, {
            onConflict: "user1_id,user2_id,room_id",
          });
        }
      }

      return NextResponse.json({ interest: updatedInterest });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/interests/[id] - 관심 표현 철회
export const DELETE = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const interestId = context?.params?.id;

      if (!interestId) {
        return NextResponse.json(
          { error: "관심 표현 ID가 필요합니다." },
          { status: 400 }
        );
      }

      // 내가 보낸 관심 표현인지 확인
      const { data: interest, error: fetchError } = await auth.supabase
        .from("interests")
        .select("*")
        .eq("id", interestId)
        .eq("from_user_id", auth.user.id)
        .single();

      if (fetchError || !interest) {
        return NextResponse.json(
          { error: "관심 표현을 찾을 수 없거나 권한이 없습니다." },
          { status: 404 }
        );
      }

      const updateData: InterestUpdate = {
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      };

      const { error } = await auth.supabase
        .from("interests")
        .update(updateData)
        .eq("id", interestId);

      if (error) {
        console.error("관심 표현 철회 오류:", error);
        return NextResponse.json(
          { error: "관심 표현 철회에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

