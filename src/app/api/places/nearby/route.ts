import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { NaverLocalService } from "@/services/naverLocalService";
import { PlaceCategory } from "@/types/store";
import { NextRequest, NextResponse } from "next/server";

// GET /api/places/nearby - 네이버 API를 사용한 주변 가게 검색
export const GET = authRequired(async (req: NextRequest, auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "카페";
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const category = searchParams.get("category");
    const display = parseInt(searchParams.get("display") || "5");

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "위치 정보(latitude, longitude)가 필요합니다." },
        { status: 400 }
      );
    }

    const naverService = new NaverLocalService();

    let places;
    if (category) {
      places = await naverService.searchByCategory(
        category as PlaceCategory,
        parseFloat(latitude),
        parseFloat(longitude),
        display
      );
    } else {
      places = await naverService.searchNearbyPlaces(
        query,
        parseFloat(latitude),
        parseFloat(longitude),
        display
      );
    }

    return NextResponse.json({ places });
  } catch (error) {
    console.error("주변 가게 검색 오류:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "주변 가게 검색에 실패했습니다.",
      },
      { status: 500 }
    );
  }
});
