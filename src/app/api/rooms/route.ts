import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { RoomInsert, RoomUpdate } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

// GET /api/rooms - 방 목록 조회
export const GET = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const place_id = searchParams.get("place_id");
    const is_active = searchParams.get("is_active");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = auth.supabase
      .from("rooms")
      .select(
        `
        *,
        places:place_id (
          id,
          name,
          address
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (place_id) {
      query = query.eq("place_id", place_id);
    }

    if (is_active !== null) {
      query = query.eq("is_active", is_active === "true");
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error("방 목록 조회 오류:", error);
      return NextResponse.json(
        { error: "방 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

// POST /api/rooms - 방 생성
export const POST = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const body = await req.json();
    const {
      place_id,
      name,
      seat_number,
      description,
      max_participants,
      room_type,
    } = body;

    if (!place_id || !name) {
      return NextResponse.json(
        { error: "카페 ID와 방 이름은 필수입니다." },
        { status: 400 }
      );
    }

    const roomData: RoomInsert = {
      place_id,
      name,
      seat_number: seat_number || null,
      description: description || null,
      max_participants: max_participants || 4,
      current_participants: 0,
      is_active: true,
      room_type: room_type || "public",
      created_by: auth.user.id,
    };

    const { data: room, error } = await auth.supabase
      .from("rooms")
      .insert(roomData)
      .select()
      .single();

    if (error) {
      console.error("방 생성 오류:", error);
      return NextResponse.json(
        { error: "방 생성에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

