"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
} from "@/components/ui";
import { Place, Room } from "@/types/database";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface PlaceWithRooms extends Place {
  rooms?: Room[];
}

interface PlaceClientProps {
  user: User;
  place: PlaceWithRooms;
}

const categoryLabels: Record<Place["category"], string> = {
  cafe: "카페",
  restaurant: "식당",
  bar: "술집",
  library: "도서관",
  co_working: "코워킹스페이스",
  other: "기타",
};

export default function PlaceClient({ user, place }: PlaceClientProps) {
  const router = useRouter();

  const activeRooms =
    place.rooms?.filter(
      (room) => room.is_active && room.current_participants > 0
    ) || [];
  const allRooms = place.rooms || [];

  const handleRoomClick = (roomId: string) => {
    router.push(`/rooms/${roomId}`);
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return "";
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{place.name}</h1>
            <Badge variant="primary">{categoryLabels[place.category]}</Badge>
          </div>
          <p className="text-muted-foreground">{place.address}</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          뒤로 가기
        </Button>
      </div>

      {/* 가게 정보 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 설명 */}
          {place.description && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground">소개</h2>
              </CardHeader>
              <CardBody>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {place.description}
                </p>
              </CardBody>
            </Card>
          )}

          {/* 활성화된 방 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">
                  활성화된 방
                </h2>
                <Badge variant="success">{activeRooms.length}개 활성</Badge>
              </div>
            </CardHeader>
            <CardBody>
              {activeRooms.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    현재 활성화된 방이 없습니다.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeRooms.map((room) => (
                    <Card
                      key={room.id}
                      onClick={() => handleRoomClick(room.id)}
                      interactive
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground text-lg">
                            {room.name}
                          </h3>
                          <Badge variant="success">활성</Badge>
                        </div>
                        {room.seat_number && (
                          <p className="text-sm text-muted-foreground mt-1">
                            좌석: {room.seat_number}
                          </p>
                        )}
                        {room.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {room.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardBody>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            참여자
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {room.current_participants} /{" "}
                            {room.max_participants}
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* 모든 방 */}
          {allRooms.length > activeRooms.length && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground">
                  모든 방
                </h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4">
                  {allRooms
                    .filter(
                      (room) => !activeRooms.find((r) => r.id === room.id)
                    )
                    .map((room) => (
                      <Card
                        key={room.id}
                        onClick={() => handleRoomClick(room.id)}
                        interactive
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-foreground text-lg">
                              {room.name}
                            </h3>
                            <Badge variant="secondary">비활성</Badge>
                          </div>
                          {room.seat_number && (
                            <p className="text-sm text-muted-foreground mt-1">
                              좌석: {room.seat_number}
                            </p>
                          )}
                          {room.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {room.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardBody>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              참여자
                            </span>
                            <span className="text-sm font-medium text-foreground">
                              {room.current_participants} /{" "}
                              {room.max_participants}
                            </span>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        {/* 사이드바 - 시설 정보 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-foreground">
                시설 정보
              </h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">총 좌석</span>
                  <span className="text-sm font-medium text-foreground">
                    {place.total_seats}석
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Wi-Fi</span>
                  <Badge
                    variant={place.wifi_available ? "success" : "secondary"}
                  >
                    {place.wifi_available ? "사용 가능" : "없음"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">콘센트</span>
                  <Badge
                    variant={place.power_outlets ? "success" : "secondary"}
                  >
                    {place.power_outlets ? "사용 가능" : "없음"}
                  </Badge>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* 위치 정보 */}
          {place.latitude && place.longitude && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-foreground">위치</h2>
              </CardHeader>
              <CardBody>
                <p className="text-sm text-muted-foreground mb-2">
                  위도: {place.latitude.toFixed(6)}
                </p>
                <p className="text-sm text-muted-foreground">
                  경도: {place.longitude.toFixed(6)}
                </p>
              </CardBody>
            </Card>
          )}

          {/* 방 만들기 버튼 */}
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push(`/places/${place.id}/rooms/new`)}
            className="w-full"
          >
            방 만들기
          </Button>
        </div>
      </div>
    </div>
  );
}
