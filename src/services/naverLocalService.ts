// 네이버 Local Search API 서비스
// ⚠️ DEPRECATED: 카카오 API로 전환되었습니다. 이 파일은 참고용으로만 유지됩니다.

import { PlaceCategory } from "@/types/store";

interface NaverLocalItem {
  title: string;
  link: string;
  category: string;
  description: string;
  telephone: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
}

interface NaverLocalResponse {
  total: number;
  start: number;
  display: number;
  items: NaverLocalItem[];
}

// 네이버 좌표를 위경도로 변환 (TM 좌표계 -> WGS84)
// 네이버 Local Search API의 mapx, mapy는 0.1mm 단위의 TM 좌표입니다
function naverCoordToLatLng(
  mapx: string,
  mapy: string
): {
  latitude: number;
  longitude: number;
} {
  // 네이버 Local Search API의 mapx, mapy는 0.1mm 단위입니다
  // 0.1mm -> 미터 변환: /10000
  const x = parseFloat(mapx) / 10000; // 0.1mm -> m
  const y = parseFloat(mapy) / 10000; // 0.1mm -> m

  // 미터를 킬로미터로 변환
  const xKm = x / 1000;
  const yKm = y / 1000;

  // 네이버 TM 좌표계를 WGS84로 변환
  // TM 좌표계 파라미터 (한국 중부)
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;
  const RADDEG = 180.0 / Math.PI;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) /
    Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  // TM 좌표를 GRID 단위로 변환
  const gridX = xKm / GRID;
  const gridY = yKm / GRID;

  // 위경도로 역변환
  let ra = Math.tan(Math.PI * 0.25 + ((gridY - YO) / re) * DEGRAD);
  ra = (re * sf) / Math.pow(ra, sn);
  let theta = ((gridX - XO) / re) * DEGRAD;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;

  const latitude = ra * Math.sin(theta) + olat;
  const longitude = theta / Math.cos(olat) + olon;

  return {
    latitude: latitude * RADDEG,
    longitude: longitude * RADDEG,
  };
}

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

// 네이버 지도 Smart Around API 응답 타입
interface NaverMapPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  tel: string;
  x: string; // 경도
  y: string; // 위도
  distance?: number;
  [key: string]: unknown;
}

interface NaverMapResponse {
  result: {
    places: NaverMapPlace[];
    [key: string]: unknown;
  };
}

export class NaverLocalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl = "https://openapi.naver.com/v1/search/local.json";
  private mapApiUrl = "https://map.naver.com/p/api/smart-around/places";

  constructor() {
    this.clientId = process.env.NAVER_CLIENT_ID || "";
    this.clientSecret = process.env.NAVER_CLIENT_SECRET || "";

    if (!this.clientId || !this.clientSecret) {
      console.warn(
        "네이버 API 키가 설정되지 않았습니다. NAVER_CLIENT_ID와 NAVER_CLIENT_SECRET 환경 변수를 설정해주세요."
      );
    }
  }

  /**
   * 경계(boundary) 계산 - 중심 좌표로부터 반경 계산
   */
  private calculateBoundary(
    latitude: number,
    longitude: number,
    radiusKm: number = 1
  ): string {
    // 간단한 근사치 계산 (1km 반경)
    const latOffset = radiusKm / 111; // 위도 1도 ≈ 111km
    const lngOffset = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const minLng = longitude - lngOffset;
    const minLat = latitude - latOffset;
    const maxLng = longitude + lngOffset;
    const maxLat = latitude + latOffset;

    return `${minLng};${minLat};${maxLng};${maxLat}`;
  }

  /**
   * 카테고리 코드 매핑
   */
  private getCategoryCode(category?: PlaceCategory): string {
    const categoryMap: Record<PlaceCategory | string, string> = {
      cafe: "01", // 카페
      restaurant: "02", // 식당
      bar: "03", // 술집
      other: "00", // 기타
    };
    return categoryMap[category || "cafe"] || "01";
  }


  /**
   * 네이버 지도 Smart Around API를 사용한 주변 가게 검색
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @param category 카테고리
   * @param display 결과 개수
   * @returns 가게 목록
   */
  async searchNearbyPlacesByMap(
    latitude: number,
    longitude: number,
    category?: PlaceCategory,
    display: number = 20
  ): Promise<PlaceSearchResult[]> {
    try {
      const searchCoord = `${longitude};${latitude}`;
      const boundary = this.calculateBoundary(latitude, longitude, 1); // 1km 반경
      const code = this.getCategoryCode(category);

      const params = new URLSearchParams({
        searchCoord,
        boundary,
        code,
        limit: display.toString(),
        sortType: "RECOMMEND",
        timeCode: "ALL", // ALL, MORNING, LUNCH, AFTERNOON, DINNER, NIGHT
      });

      const response = await fetch(`${this.mapApiUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
          "Referer": "https://map.naver.com/",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("네이버 지도 API 오류:", errorText);
        throw new Error(`네이버 지도 API 호출 실패: ${response.status}`);
      }

      const data: NaverMapResponse = await response.json();

      if (!data.result || !data.result.places) {
        console.warn("네이버 지도 API 응답 형식이 예상과 다릅니다:", data);
        return [];
      }

      const places: PlaceSearchResult[] = data.result.places.map((item) => {
        const lat = parseFloat(item.y);
        const lng = parseFloat(item.x);

        const place: PlaceSearchResult = {
          id: item.id || `map_${item.name}_${lat}_${lng}`,
          name: item.name || "",
          address: item.address || "",
          roadAddress: item.roadAddress || item.address || "",
          category: item.category || "",
          telephone: item.tel || "",
          description: "",
          latitude: lat,
          longitude: lng,
        };

        // 거리 계산
        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          place.distance = calculateDistance(latitude, longitude, lat, lng);
        }

        return place;
      });

      // 거리순으로 정렬
      const sortedPlaces = places
        .filter(
          (place) =>
            place.distance !== undefined &&
            !isNaN(place.distance) &&
            place.distance >= 0
        )
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      return sortedPlaces.slice(0, display);
    } catch (error) {
      console.error("네이버 지도 API 검색 실패:", error);
      // 실패 시 기존 Local Search API로 폴백
      return this.searchNearbyPlacesFallback(
        category ? this.getCategoryQuery(category) : "카페",
        latitude,
        longitude,
        display
      );
    }
  }

  /**
   * 카테고리 코드를 검색어로 변환
   */
  private getCategoryQuery(category: PlaceCategory): string {
    const categoryMap: Record<string, string> = {
      cafe: "카페",
      restaurant: "식당",
      bar: "술집",
      library: "도서관",
      co_working: "공유오피스",
      other: "가게",
    };
    return categoryMap[category] || "카페";
  }

  /**
   * 기존 Local Search API를 사용한 폴백 검색
   */
  private async searchNearbyPlacesFallback(
    query: string = "카페",
    latitude: number,
    longitude: number,
    display: number = 5
  ): Promise<PlaceSearchResult[]> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("네이버 API 키가 설정되지 않았습니다.");
    }

    try {
      const maxDisplay = 100;
      const searchDisplay = Math.min(maxDisplay, display * 10);

      const params = new URLSearchParams({
        query,
        display: searchDisplay.toString(),
        sort: "random",
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: "GET",
        headers: {
          "X-Naver-Client-Id": this.clientId,
          "X-Naver-Client-Secret": this.clientSecret,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("네이버 API 오류:", errorText);
        throw new Error(`네이버 API 호출 실패: ${response.status}`);
      }

      const data: NaverLocalResponse = await response.json();

      const places: PlaceSearchResult[] = data.items.map((item, index) => {
        const { latitude: lat, longitude: lng } = naverCoordToLatLng(
          item.mapx,
          item.mapy
        );

        const place: PlaceSearchResult = {
          id: `naver_${item.link.split("/").pop() || index}`,
          name: item.title.replace(/<[^>]*>/g, ""),
          address: item.address,
          roadAddress: item.roadAddress,
          category: item.category,
          telephone: item.telephone,
          description: item.description,
          latitude: lat,
          longitude: lng,
        };

        if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
          place.distance = calculateDistance(latitude, longitude, lat, lng);
        }

        return place;
      });

      const validPlaces = places
        .filter(
          (place) =>
            place.distance !== undefined &&
            !isNaN(place.distance) &&
            place.distance >= 0 &&
            place.distance < 10
        )
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      return validPlaces.slice(0, display);
    } catch (error) {
      console.error("네이버 가게 검색 실패:", error);
      throw error;
    }
  }

  /**
   * 주변 가게 검색 (메인 메서드 - 지도 API 우선 사용)
   * @param query 검색어 (예: "카페", "식당", "술집")
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @param display 결과 개수
   * @returns 가게 목록
   */
  async searchNearbyPlaces(
    query: string = "카페",
    latitude?: number,
    longitude?: number,
    display: number = 5
  ): Promise<PlaceSearchResult[]> {
    if (!latitude || !longitude) {
      throw new Error("위치 정보가 필요합니다.");
    }

    // 네이버 지도 API를 우선 사용 (더 정확한 위치 기반 검색)
    try {
      // query를 category로 변환 시도
      const categoryMap: Record<string, PlaceCategory> = {
        카페: "cafe",
        식당: "restaurant",
        술집: "bar",
      };

      const category = categoryMap[query] as PlaceCategory | undefined;

      return await this.searchNearbyPlacesByMap(
        latitude,
        longitude,
        category,
        display
      );
    } catch (error) {
      console.warn("네이버 지도 API 실패, 폴백 사용:", error);
      // 실패 시 기존 API 사용
      return this.searchNearbyPlacesFallback(query, latitude, longitude, display);
    }
  }

  /**
   * 카테고리별 주변 가게 검색
   */
  async searchByCategory(
    category: PlaceCategory,
    latitude?: number,
    longitude?: number,
    display: number = 5
  ): Promise<PlaceSearchResult[]> {
    if (!latitude || !longitude) {
      throw new Error("위치 정보가 필요합니다.");
    }

    // 네이버 지도 API를 우선 사용
    try {
      return await this.searchNearbyPlacesByMap(
        latitude,
        longitude,
        category,
        display
      );
    } catch (error) {
      console.warn("네이버 지도 API 실패, 폴백 사용:", error);
      // 실패 시 기존 API 사용
      const categoryMap: Record<string, string> = {
        cafe: "카페",
        restaurant: "식당",
        bar: "술집",
        other: "가게",
      };
      const query = categoryMap[category] || "가게";
      return this.searchNearbyPlacesFallback(query, latitude, longitude, display);
    }
  }
}
