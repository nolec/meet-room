import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { RoomParticipantInsert } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/lib/auth/middleware";

// GET /api/rooms/[id]/participants - 방 참여자 목록 조회
export const GET = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const roomId = context?.params?.id;

      if (!roomId) {
        return NextResponse.json(
          { error: "방 ID가 필요합니다." },
          { status: 400 }
        );
      }

      const { data: participants, error } = await auth.supabase
        .from("room_participants")
        .select(
          `
          *,
          profiles:user_id (
            id,
            name,
            avatar_url,
            bio
          )
        `
        )
        .eq("room_id", roomId)
        .eq("status", "active");

      if (error) {
        console.error("참여자 목록 조회 오류:", error);
        return NextResponse.json(
          { error: "참여자 목록을 불러올 수 없습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ participants });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

// POST /api/rooms/[id]/participants - 방 참여
export const POST = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const roomId = context?.params?.id;

      if (!roomId) {
        return NextResponse.json(
          { error: "방 ID가 필요합니다." },
          { status: 400 }
        );
      }

      // 방이 존재하고 활성화되어 있는지 확인
      const { data: room, error: roomError } = await auth.supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      if (roomError || !room || !room.is_active) {
        return NextResponse.json(
          { error: "참여할 수 없는 방입니다." },
          { status: 400 }
        );
      }

      // 이미 참여 중인지 확인
      const { data: existing } = await auth.supabase
        .from("room_participants")
        .select("*")
        .eq("room_id", roomId)
        .eq("user_id", auth.user.id)
        .single();

      if (existing && existing.status === "active") {
        return NextResponse.json(
          { error: "이미 참여 중인 방입니다." },
          { status: 400 }
        );
      }

      // 최대 인원 확인
      if (room.current_participants >= room.max_participants) {
        return NextResponse.json(
          { error: "방이 가득 찼습니다." },
          { status: 400 }
        );
      }

      // 참여자 추가
      const participantData: RoomParticipantInsert = {
        room_id: roomId,
        user_id: auth.user.id,
        status: "active",
      };

      const { data: participant, error } = await auth.supabase
        .from("room_participants")
        .upsert(participantData, {
          onConflict: "room_id,user_id",
        })
        .select()
        .single();

      if (error) {
        console.error("방 참여 오류:", error);
        return NextResponse.json(
          { error: "방 참여에 실패했습니다." },
          { status: 500 }
        );
      }

      // 현재 참여자 수 업데이트
      await auth.supabase
        .from("rooms")
        .update({
          current_participants: room.current_participants + 1,
        })
        .eq("id", roomId);

      return NextResponse.json({ participant }, { status: 201 });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/rooms/[id]/participants - 방 나가기
export const DELETE = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const roomId = context?.params?.id;

      if (!roomId) {
        return NextResponse.json(
          { error: "방 ID가 필요합니다." },
          { status: 400 }
        );
      }

      // 방 정보 가져오기
      const { data: room } = await auth.supabase
        .from("rooms")
        .select("*")
        .eq("id", roomId)
        .single();

      // 참여 상태를 'left'로 변경
      const { error } = await auth.supabase
        .from("room_participants")
        .update({
          status: "left",
          last_active_at: new Date().toISOString(),
        })
        .eq("room_id", roomId)
        .eq("user_id", auth.user.id);

      if (error) {
        console.error("방 나가기 오류:", error);
        return NextResponse.json(
          { error: "방 나가기에 실패했습니다." },
          { status: 500 }
        );
      }

      // 현재 참여자 수 업데이트
      if (room) {
        await auth.supabase
          .from("rooms")
          .update({
            current_participants: Math.max(0, room.current_participants - 1),
          })
          .eq("id", roomId);
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

