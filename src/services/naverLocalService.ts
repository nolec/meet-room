// 네이버 Local Search API 서비스

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

export class NaverLocalService {
  private clientId: string;
  private clientSecret: string;
  private baseUrl = "https://openapi.naver.com/v1/search/local.json";

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
   * 주변 가게 검색
   * @param query 검색어 (예: "카페", "식당", "술집")
   * @param latitude 사용자 위도
   * @param longitude 사용자 경도
   * @param display 결과 개수 (최대 5)
   * @returns 가게 목록
   */
  async searchNearbyPlaces(
    query: string = "카페",
    latitude?: number,
    longitude?: number,
    display: number = 5
  ): Promise<PlaceSearchResult[]> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("네이버 API 키가 설정되지 않았습니다.");
    }

    try {
      // 네이버 Local Search API는 위치 기반 검색을 지원하지 않으므로
      // query에 지역명을 포함하거나, 일반 검색 후 클라이언트에서 거리 계산
      // TODO: 네이버 Geocoding API를 사용하여 위치를 주소로 변환하고
      // query에 지역명을 포함하는 것이 더 정확할 수 있습니다
      // 현재는 query만 사용하고 클라이언트에서 거리 계산

      const params = new URLSearchParams({
        query,
        display: display.toString(),
        sort: "random", // 정렬 방식: random, comment (거리순 정렬 불가)
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
        // 네이버 좌표를 위경도로 변환
        const { latitude: lat, longitude: lng } = naverCoordToLatLng(
          item.mapx,
          item.mapy
        );

        // 디버깅: 변환된 좌표 확인
        console.log(
          `가게: ${item.title}, mapx: ${item.mapx}, mapy: ${item.mapy}, 변환된 좌표: lat=${lat}, lng=${lng}`
        );

        const place: PlaceSearchResult = {
          id: `naver_${item.link.split("/").pop() || index}`,
          name: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
          address: item.address,
          roadAddress: item.roadAddress,
          category: item.category,
          telephone: item.telephone,
          description: item.description,
          latitude: lat,
          longitude: lng,
        };

        // 사용자 위치가 있으면 거리 계산
        if (
          latitude &&
          longitude &&
          !isNaN(lat) &&
          !isNaN(lng) &&
          lat !== 0 &&
          lng !== 0
        ) {
          place.distance = calculateDistance(latitude, longitude, lat, lng);
          console.log(
            `거리 계산: 사용자 위치(${latitude}, ${longitude}), 가게 위치(${lat}, ${lng}), 거리=${place.distance}km`
          );
        }

        return place;
      });

      // 거리순으로 정렬
      // 유효한 좌표와 거리를 가진 가게만 필터링
      if (latitude && longitude) {
        const validPlaces = places.filter(
          (place) =>
            place.distance !== undefined &&
            !isNaN(place.distance) &&
            place.distance < 100 // 100km 이내의 가게만 표시
        );

        validPlaces.sort(
          (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
        );

        return validPlaces.slice(0, display); // 거리순으로 정렬된 결과 반환
      }

      return places;
    } catch (error) {
      console.error("네이버 가게 검색 실패:", error);
      throw error;
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
    const categoryMap: Record<string, string> = {
      cafe: "카페",
      restaurant: "식당",
      bar: "술집",
      other: "가게",
    };

    const query = categoryMap[category] || "가게";
    return this.searchNearbyPlaces(query, latitude, longitude, display);
  }
}
