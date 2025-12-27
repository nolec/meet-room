import { requireAuth } from "@/lib/auth/server";
import { createClient } from "@/lib/supabase/server";
import { KakaoLocalService } from "@/services/kakaoLocalService";
import { Room } from "@/types/database";
import { EmptyState } from "@/components/ui";
import PlaceClient from "./PlaceClient";

// UUID 형식인지 확인 (Supabase ID는 UUID 형식)
function isUUID(str: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}

export default async function PlaceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAuth();
  const { id: placeId } = await params;

  const supabase = await createClient();

  // ID 형식으로 Supabase인지 카카오인지 구분
  const isSupabasePlace = isUUID(placeId);

  let place;
  let rooms: Room[] = [];

  if (isSupabasePlace) {
    // Supabase에 저장된 가게
    const { data: supabasePlace, error } = await supabase
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

    if (error || !supabasePlace) {
      return (
        <EmptyState
          title="가게를 찾을 수 없습니다"
          message="요청하신 가게 정보를 찾을 수 없습니다."
        />
      );
    }

    place = supabasePlace;
    rooms = supabasePlace.rooms || [];
  } else {
    // 카카오 API에서 검색한 가게
    const kakaoService = new KakaoLocalService();
    const kakaoPlace = await kakaoService.getPlaceById(placeId);

    if (!kakaoPlace) {
      return (
        <EmptyState
          title="가게를 찾을 수 없습니다"
          message="요청하신 가게 정보를 찾을 수 없습니다."
        />
      );
    }

    // PlaceSearchResult를 Place 타입으로 변환
    place = {
      id: kakaoPlace.id,
      name: kakaoPlace.name,
      address: kakaoPlace.address,
      latitude: kakaoPlace.latitude,
      longitude: kakaoPlace.longitude,
      category: "cafe" as const, // 기본값 (카테고리 매핑 필요 시 개선)
      description: kakaoPlace.description || null,
      total_seats: 0,
      wifi_available: false,
      power_outlets: false,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 카카오 가게의 경우 rooms는 빈 배열 (Supabase에서 해당 가게의 rooms 조회 시도)
    // 카카오 ID로 Supabase에서 rooms를 찾을 수 없으므로 빈 배열
    rooms = [];
  }

  // Place 타입에 rooms 추가
  const placeWithRooms = {
    ...place,
    rooms,
  };

  return <PlaceClient user={user} place={placeWithRooms} />;
}
