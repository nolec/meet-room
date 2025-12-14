import { authRequired, AuthResult } from "@/lib/auth/middleware";
import { getIntParam } from "@/lib/utils";
import { KakaoLocalService } from "@/services/kakaoLocalService";
import { PlaceCategory } from "@/types/store";
import { NextRequest, NextResponse } from "next/server";

// 기본값 상수
const DEFAULT_DISPLAY = 15;
const DEFAULT_QUERY = "카페";
const DEFAULT_PAGE = 1;

// GET   - 카카오 API를 사용한 주변 가게 검색
export const GET = authRequired(async (req: NextRequest, _auth: AuthResult) => {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || DEFAULT_QUERY;
    const latitude = searchParams.get("latitude");
    const longitude = searchParams.get("longitude");
    const category = searchParams.get("category");
    const display = getIntParam(searchParams, "display", DEFAULT_DISPLAY);
    const page = getIntParam(searchParams, "page", DEFAULT_PAGE);

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: "위치 정보(latitude, longitude)가 필요합니다." },
        { status: 400 }
      );
    }

    const kakaoService = new KakaoLocalService();

    let result;
    if (category) {
      result = await kakaoService.searchByCategory(
        category as PlaceCategory,
        parseFloat(latitude),
        parseFloat(longitude),
        2000, // 2km 반경
        display,
        page
      );
    } else {
      result = await kakaoService.searchNearbyPlaces(
        query,
        parseFloat(latitude),
        parseFloat(longitude),
        display,
        page
      );
    }

    return NextResponse.json({
      places: result.places,
      isEnd: result.isEnd,
      totalCount: result.totalCount,
    });
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
