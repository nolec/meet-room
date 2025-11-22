import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { PlaceInsert, PlaceUpdate } from "@/types/database";
import { NextRequest, NextResponse } from "next/server";

// 거리 계산 함수 (Haversine 공식)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // 지구 반지름 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// GET /api/places - 가게 목록 조회
export const GET = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = auth.supabase
      .from("places")
      .select(
        `
        *,
        rooms:rooms (
          id,
          name,
          is_active,
          current_participants,
          max_participants
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.eq("category", category);
    }

    const { data: places, error } = await query;

    // 위치 기반 정렬 (클라이언트에서 처리)
    let sortedPlaces = places || [];
    if (latitude && longitude && places) {
      const userLat = parseFloat(latitude);
      const userLng = parseFloat(longitude);

      sortedPlaces = places
        .filter((place) => place.latitude && place.longitude)
        .map((place) => {
          const distance = calculateDistance(
            userLat,
            userLng,
            parseFloat(place.latitude!),
            parseFloat(place.longitude!)
          );
          return { ...place, distance };
        })
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    if (error) {
      console.error("가게 목록 조회 오류:", error);
      return NextResponse.json(
        { error: "가게 목록을 불러올 수 없습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ places: sortedPlaces });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

// POST /api/places - 가게 등록
export const POST = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const body = await req.json();
    const {
      name,
      address,
      latitude,
      longitude,
      category,
      description,
      total_seats,
      wifi_available,
      power_outlets,
    } = body;

    if (!name || !address) {
      return NextResponse.json(
        { error: "가게 이름과 주소는 필수입니다." },
        { status: 400 }
      );
    }

    const placeData: PlaceInsert = {
      name,
      address,
      latitude: latitude || null,
      longitude: longitude || null,
      category: category || "cafe",
      description: description || null,
      total_seats: total_seats || 0,
      wifi_available: wifi_available || false,
      power_outlets: power_outlets || false,
      created_by: auth.user.id,
    };

    const { data: place, error } = await auth.supabase
      .from("places")
      .insert(placeData)
      .select()
      .single();

    if (error) {
      console.error("가게 등록 오류:", error);
      return NextResponse.json(
        { error: "가게 등록에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ place }, { status: 201 });
  } catch (error) {
    console.error("예상치 못한 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
});

