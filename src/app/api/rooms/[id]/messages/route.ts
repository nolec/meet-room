import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { getIntParam } from "@/lib/utils";
import { MessageInsert } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/lib/auth/middleware";

// 기본값 상수
const DEFAULT_LIMIT = 50;
const DEFAULT_OFFSET = 0;

// GET /api/rooms/[id]/messages - 채팅 메시지 조회
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

      // 참여자 확인
      const { data: participant } = await auth.supabase
        .from("room_participants")
        .select("*")
        .eq("room_id", roomId)
        .eq("user_id", auth.user.id)
        .eq("status", "active")
        .single();

      if (!participant) {
        return NextResponse.json(
          { error: "방에 참여해야 메시지를 볼 수 있습니다." },
          { status: 403 }
        );
      }

      const { searchParams } = new URL(req.url);
      const limit = getIntParam(searchParams, "limit", DEFAULT_LIMIT);
      const offset = getIntParam(searchParams, "offset", DEFAULT_OFFSET);

      const { data: messages, error } = await auth.supabase
        .from("messages")
        .select(
          `
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("메시지 조회 오류:", error);
        return NextResponse.json(
          { error: "메시지를 불러올 수 없습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ messages: messages.reverse() }); // 오래된 순서로
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);

// POST /api/rooms/[id]/messages - 메시지 전송
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

      // 참여자 확인
      const { data: participant } = await auth.supabase
        .from("room_participants")
        .select("*")
        .eq("room_id", roomId)
        .eq("user_id", auth.user.id)
        .eq("status", "active")
        .single();

      if (!participant) {
        return NextResponse.json(
          { error: "방에 참여해야 메시지를 보낼 수 있습니다." },
          { status: 403 }
        );
      }

      const body = await req.json();
      const { content, message_type } = body;

      if (!content || content.trim().length === 0) {
        return NextResponse.json(
          { error: "메시지 내용은 필수입니다." },
          { status: 400 }
        );
      }

      const messageData: MessageInsert = {
        room_id: roomId,
        user_id: auth.user.id,
        content: content.trim(),
        message_type: message_type || "text",
      };

      const { data: message, error } = await auth.supabase
        .from("messages")
        .insert(messageData)
        .select(
          `
          *,
          profiles:user_id (
            id,
            name,
            avatar_url
          )
        `
        )
        .single();

      if (error) {
        console.error("메시지 전송 오류:", error);
        return NextResponse.json(
          { error: "메시지 전송에 실패했습니다." },
          { status: 500 }
        );
      }

      return NextResponse.json({ message }, { status: 201 });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);
