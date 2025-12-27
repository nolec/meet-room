import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/lib/auth/middleware";

// GET /api/places/[id] - 가게 상세 조회 (읽기 전용)
export const GET = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const placeId = context?.params?.id;

      if (!placeId) {
        return NextResponse.json(
          { error: "가게 ID가 필요합니다." },
          { status: 400 }
        );
      }

      const { data: place, error } = await auth.supabase
        .from("places")
        .select(
          `
          *,
          rooms:rooms (
            id,
            name,
            seat_number,
            description,
            is_active,
            current_participants,
            max_participants,
            room_type,
            created_at
          )
        `
        )
        .eq("id", placeId)
        .single();

      if (error) {
        console.error("가게 조회 오류:", error);
        return NextResponse.json(
          { error: "가게를 찾을 수 없습니다." },
          { status: 404 }
        );
      }

      return NextResponse.json({ place });
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      return NextResponse.json(
        { error: "서버 오류가 발생했습니다." },
        { status: 500 }
      );
    }
  }
);
