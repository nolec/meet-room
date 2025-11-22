import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { PlaceUpdate } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";
import { RouteParams } from "@/lib/auth/middleware";

// GET /api/places/[id] - 가게 상세 조회
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
        .select("*")
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

// PUT /api/places/[id] - 가게 정보 수정
export const PUT = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const placeId = context?.params?.id;

      if (!placeId) {
        return NextResponse.json(
          { error: "가게 ID가 필요합니다." },
          { status: 400 }
        );
      }

      const body = await req.json();
      
      // 등록한 사용자인지 확인 (RLS 정책에서도 처리하지만 명시적으로 체크)
      const { data: existingPlace } = await auth.supabase
        .from("places")
        .select("created_by")
        .eq("id", placeId)
        .single();

      if (existingPlace && existingPlace.created_by !== auth.user.id) {
        return NextResponse.json(
          { error: "가게를 수정할 권한이 없습니다." },
          { status: 403 }
        );
      }

      const updateData: PlaceUpdate = {
        ...body,
        updated_at: new Date().toISOString(),
      };

      // created_by는 변경 불가
      delete (updateData as any).created_by;

      const { data: place, error } = await auth.supabase
        .from("places")
        .update(updateData)
        .eq("id", placeId)
        .select()
        .single();

      if (error) {
        console.error("가게 수정 오류:", error);
        return NextResponse.json(
          { error: "가게 수정에 실패했습니다." },
          { status: 500 }
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

// DELETE /api/places/[id] - 가게 삭제
export const DELETE = authRequired(
  async (req: NextRequest, auth: AuthResult, context?: RouteParams) => {
    try {
      const placeId = context?.params?.id;

      if (!placeId) {
        return NextResponse.json(
          { error: "가게 ID가 필요합니다." },
          { status: 400 }
        );
      }

      // 등록한 사용자인지 확인 (RLS 정책에서도 처리하지만 명시적으로 체크)
      const { data: existingPlace } = await auth.supabase
        .from("places")
        .select("created_by")
        .eq("id", placeId)
        .single();

      if (existingPlace && existingPlace.created_by !== auth.user.id) {
        return NextResponse.json(
          { error: "가게를 삭제할 권한이 없습니다." },
          { status: 403 }
        );
      }

      const { error } = await auth.supabase
        .from("places")
        .delete()
        .eq("id", placeId);

      if (error) {
        console.error("가게 삭제 오류:", error);
        return NextResponse.json(
          { error: "가게 삭제에 실패했습니다." },
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

