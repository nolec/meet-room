// 카카오 로컬 API 서비스
// 참고: https://developers.kakao.com/docs/latest/ko/local/dev-guide

import { PlaceCategory } from "@/types/store";

// 카카오 로컬 API 응답 타입
interface KakaoPlace {
  id: string;
  place_name: string;
  category_name: string;
  category_group_code: string;
  category_group_name: string;
  phone: string;
  address_name: string;
  road_address_name: string;
  x: string; // 경도
  y: string; // 위도
  place_url: string;
  distance?: string; // 거리 (미터) - API에서 제공
}

interface KakaoLocalResponse {
  documents: KakaoPlace[];
  meta: {
    total_count: number;
    pageable_count: number;
    is_end: boolean;
  };
}

export interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  category: string;
  telephone: string;
  description: string;
  latitude: number;
  longitude: number;
  distance?: number; // 사용자 위치로부터의 거리 (km)
}

export class KakaoLocalService {
  private readonly restApiKey: string;
  private readonly baseUrl =
    process.env.KAKAO_API_BASE_URL || "https://dapi.kakao.com/v2";

  // 카테고리 코드 매핑
  private static readonly CATEGORY_MAP: Record<PlaceCategory, string> = {
    cafe: "CE7", // 카페
    restaurant: "FD6", // 음식점
    bar: "CE7", // 카페 (카카오는 술집이 별도 카테고리가 없음)
    other: "", // 기타 (키워드 검색 사용)
  };

  // 검색어를 카테고리로 변환
  private static readonly QUERY_TO_CATEGORY: Record<string, PlaceCategory> = {
    카페: "cafe",
    식당: "restaurant",
    술집: "bar",
  };

  constructor() {
    this.restApiKey = process.env.KAKAO_REST_API_KEY || "";

    if (!this.restApiKey) {
      console.warn(
        "카카오 API 키가 설정되지 않았습니다. KAKAO_REST_API_KEY 환경 변수를 설정해주세요."
      );
    }
  }

  /**
   * 카테고리 코드 조회
   */
  private getCategoryCode(category: PlaceCategory): string {
    return KakaoLocalService.CATEGORY_MAP[category] || "";
  }

  /**
   * 카카오 Place를 PlaceSearchResult로 변환
   */
  private transformPlace(item: KakaoPlace): PlaceSearchResult {
    const lat = parseFloat(item.y);
    const lng = parseFloat(item.x);

    // API에서 제공하는 거리 사용 (미터 단위 → km 변환)
    const distanceKm = item.distance
      ? parseFloat(item.distance) / 1000
      : undefined;

    return {
      id: item.id,
      name: item.place_name,
      address: item.address_name,
      roadAddress: item.road_address_name || item.address_name,
      category: item.category_name,
      telephone: item.phone || "",
      description: "",
      latitude: lat,
      longitude: lng,
      distance: distanceKm,
    };
  }

  /**
   * 카카오 API 호출
   */
  private async callKakaoAPI(
    endpoint: string,
    params: URLSearchParams
  ): Promise<KakaoLocalResponse> {
    if (!this.restApiKey) {
      throw new Error("카카오 API 키가 설정되지 않았습니다.");
    }

    // Development 모드에서만 params 로깅
    if (process.env.NODE_ENV === "development") {
      console.log("[Kakao API] Endpoint:", endpoint);
      console.log("[Kakao API] Params:", Object.fromEntries(params));
    }

    const url = `${this.baseUrl}${endpoint}?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `KakaoAK ${this.restApiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("카카오 API 오류:", errorText);
      throw new Error(`카카오 API 호출 실패: ${response.status}`);
    }

    return response.json();
  }

  /**
   * 카테고리별 주변 장소 검색
   * @param category 카테고리
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @param radius 검색 반경 (미터, 기본값: 2000m = 2km)
   * @param display 결과 개수 (최대 15)
   * @param page 페이지 번호 (1부터 시작)
   * @returns 가게 목록 및 페이지 정보
   */
  async searchByCategory(
    category: PlaceCategory,
    latitude: number,
    longitude: number,
    radius: number = 2000,
    display: number = 15,
    page: number = 1
  ): Promise<{
    places: PlaceSearchResult[];
    isEnd: boolean;
    totalCount: number;
  }> {
    const categoryCode = this.getCategoryCode(category);

    // 카테고리가 없으면 키워드 검색으로 폴백
    if (!categoryCode) {
      return this.searchByKeyword(
        "가게",
        latitude,
        longitude,
        radius,
        display,
        page
      );
    }

    const params = new URLSearchParams({
      category_group_code: categoryCode,
      x: longitude.toString(),
      y: latitude.toString(),
      radius: radius.toString(),
      size: Math.min(display, 15).toString(),
      page: page.toString(),
      sort: "distance", // 거리순 정렬
    });

    const data = await this.callKakaoAPI("/local/search/category.json", params);

    // Development 모드에서만 meta 정보 로깅
    if (process.env.NODE_ENV === "development") {
      console.log("[Kakao API] Category Search Response:", {
        total_count: data.meta.total_count,
        pageable_count: data.meta.pageable_count,
        is_end: data.meta.is_end,
        documents_count: data.documents.length,
        page,
      });
    }

    // 결과가 적으면 키워드 검색으로 폴백 시도 (첫 페이지에서만)
    if (data.documents.length < display && category === "cafe" && page === 1) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "[Kakao API] 카테고리 검색 결과가 부족하여 키워드 검색으로 폴백합니다."
        );
      }
      return this.searchByKeyword(
        "카페",
        latitude,
        longitude,
        radius * 2,
        display,
        page
      );
    }

    return {
      places: data.documents.map((item) => this.transformPlace(item)),
      isEnd: data.meta.is_end,
      totalCount: data.meta.total_count,
    };
  }

  /**
   * 키워드로 주변 장소 검색
   * @param query 검색어 (예: "카페", "식당", "스타벅스")
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @param radius 검색 반경 (미터, 기본값: 2000m = 2km)
   * @param display 결과 개수 (최대 15)
   * @param page 페이지 번호 (1부터 시작)
   * @returns 가게 목록 및 페이지 정보
   */
  async searchByKeyword(
    query: string,
    latitude: number,
    longitude: number,
    radius: number = 2000,
    display: number = 15,
    page: number = 1
  ): Promise<{
    places: PlaceSearchResult[];
    isEnd: boolean;
    totalCount: number;
  }> {
    const params = new URLSearchParams({
      query,
      x: longitude.toString(),
      y: latitude.toString(),
      radius: radius.toString(),
      size: Math.min(display, 15).toString(),
      page: page.toString(),
      sort: "distance", // 거리순 정렬
    });

    const data = await this.callKakaoAPI("/local/search/keyword.json", params);

    // Development 모드에서만 meta 정보 로깅
    if (process.env.NODE_ENV === "development") {
      console.log("[Kakao API] Keyword Search Response:", {
        query,
        total_count: data.meta.total_count,
        pageable_count: data.meta.pageable_count,
        is_end: data.meta.is_end,
        documents_count: data.documents.length,
        page,
      });
    }

    return {
      places: data.documents.map((item) => this.transformPlace(item)),
      isEnd: data.meta.is_end,
      totalCount: data.meta.total_count,
    };
  }

  /**
   * 주변 가게 검색 (메인 메서드)
   * @param query 검색어 (예: "카페", "식당", "술집")
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @param display 결과 개수
   * @param page 페이지 번호 (1부터 시작)
   * @returns 가게 목록 및 페이지 정보
   */
  async searchNearbyPlaces(
    query: string = "카페",
    latitude?: number,
    longitude?: number,
    display: number = 15,
    page: number = 1
  ): Promise<{
    places: PlaceSearchResult[];
    isEnd: boolean;
    totalCount: number;
  }> {
    if (!latitude || !longitude) {
      throw new Error("위치 정보가 필요합니다.");
    }

    // 검색어를 카테고리로 변환 시도
    const category = KakaoLocalService.QUERY_TO_CATEGORY[query] as
      | PlaceCategory
      | undefined;

    if (category) {
      return this.searchByCategory(
        category,
        latitude,
        longitude,
        2000,
        display,
        page
      );
    }

    return this.searchByKeyword(
      query,
      latitude,
      longitude,
      2000,
      display,
      page
    );
  }
}
