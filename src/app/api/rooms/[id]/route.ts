import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { RoomUpdate } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/lib/auth/middleware";

// GET /api/rooms/[id] - 방 상세 조회 (참여자 포함)
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

      const { data: room, error } = await auth.supabase
        .from("rooms")
        .select(
          `
          *,
          places:place_id (
            id,
            name,
            address
          ),
          participants:room_participants (
            id,
            user_id,
            joined_at,
            status,
            profiles:user_id (
              id,
              name,
              avatar_url,
              bio
            )
          )
        `
        )
        .eq("id", roomId)
        .single();

      if (error) {
        console.error("방 조회 오류:", error);
        return NextResponse.json(
          { error: "방을 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json({ room });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

// PUT /api/rooms/[id] - 방 정보 수정
export const PUT = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const roomId = context?.params?.id;

      if (!roomId) {
        return NextResponse.json(
          { error: "방 ID가 필요합니다." },
          { status: 400 }
        );
      }

      const body = await req.json();
      const updateData: RoomUpdate = {
        ...body,
        updated_at: new Date().toISOString(),
      };

      const { data: room, error } = await auth.supabase
        .from("rooms")
        .update(updateData)
        .eq("id", roomId)
        .eq("created_by", auth.user.id) // 생성자만 수정 가능
        .select()
        .single();

      if (error) {
        console.error("방 수정 오류:", error);
        return NextResponse.json(
          { error: "방 수정에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ room });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/rooms/[id] - 방 삭제
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

      const { error } = await auth.supabase
        .from("rooms")
        .delete()
        .eq("id", roomId)
        .eq("created_by", auth.user.id); // 생성자만 삭제 가능

      if (error) {
        console.error("방 삭제 오류:", error);
        return NextResponse.json(
          { error: "방 삭제에 실패했습니다." },
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

