"use client";

import { Badge, Button, Card, CardBody, CardHeader } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface PlaceSearchResult {
  id: string;
  name: string;
  address: string;
  roadAddress: string;
  category: string;
  telephone: string;
  description: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface PlaceWithRooms {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category: string;
  rooms: Array<{
    id: string;
    name: string;
    is_active: boolean;
    current_participants: number;
    max_participants: number;
  }>;
}

interface DashboardClientProps {
  user: User;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const { signOut } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [nearbyPlaces, setNearbyPlaces] = useState<PlaceSearchResult[]>([]);
  const [activePlaces, setActivePlaces] = useState<PlaceWithRooms[]>([]);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("위치 정보 가져오기 실패:", error);
          setLocationError("위치 정보를 가져올 수 없습니다.");
          setLoading(false);
        }
      );
    } else {
      setLocationError("브라우저가 위치 정보를 지원하지 않습니다.");
      setLoading(false);
    }
  }, []);

  // 주변 가게 가져오기
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyPlaces = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/places/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&display=5`
        );

        if (!response.ok) {
          throw new Error("주변 가게를 불러올 수 없습니다.");
        }

        const data = await response.json();
        setNearbyPlaces(data.places || []);
      } catch (error) {
        console.error("주변 가게 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [userLocation]);

  // 활성화된 방이 있는 가게 가져오기
  useEffect(() => {
    const fetchActivePlaces = async () => {
      try {
        const response = await fetch("/api/places?limit=50");

        if (!response.ok) {
          throw new Error("가게 목록을 불러올 수 없습니다.");
        }

        const data = await response.json();

        // 활성 방이 있는 가게만 필터링
        const placesWithActiveRooms = (data.places || []).filter(
          (place: PlaceWithRooms) => {
            return (
              place.rooms &&
              place.rooms.some(
                (room) => room.is_active && room.current_participants > 0
              )
            );
          }
        );

        setActivePlaces(placesWithActiveRooms);
      } catch (error) {
        console.error("활성 가게 가져오기 실패:", error);
      }
    };

    fetchActivePlaces();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  const formatDistance = (distance?: number): string => {
    if (!distance) return "";
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  };

  const getActiveRoomsCount = (place: PlaceWithRooms): number => {
    return (
      place.rooms?.filter(
        (room) => room.is_active && room.current_participants > 0
      ).length || 0
    );
  };

  const getTotalParticipants = (place: PlaceWithRooms): number => {
    return (
      place.rooms?.reduce(
        (sum, room) => sum + (room.is_active ? room.current_participants : 0),
        0
      ) || 0
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            안녕하세요, {user.user_metadata?.name || user.email}님!
          </h1>
          <p className="text-muted-foreground mt-2">
            가게에서 새로운 인연을 만들어보세요.
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          로그아웃
        </Button>
      </div>

      {/* 주변 가게 섹션 */}
      <div className="space-y-6 mb-12">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">내 주변 가게</h2>
          <Button variant="primary" onClick={() => router.push("/places/new")}>
            가게 등록하기
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">가게 정보를 불러오는 중...</p>
          </div>
        ) : locationError ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">{locationError}</p>
            <p className="text-sm text-muted-foreground">
              위치 정보 접근 권한을 허용해주세요.
            </p>
          </div>
        ) : nearbyPlaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              주변에 가게가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyPlaces.map((place) => (
              <Card
                key={place.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/places/${place.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-lg">
                      {place.name}
                    </h3>
                    {place.distance && (
                      <Badge variant="primary" className="text-xs">
                        {formatDistance(place.distance)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {place.roadAddress || place.address}
                  </p>
                  {place.category && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {place.category}
                    </p>
                  )}
                </CardHeader>
                <CardBody>
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/places/${place.id}`);
                    }}
                  >
                    둘러보기
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 활성화된 방이 있는 가게 섹션 */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">
            활성화된 방이 있는 가게
          </h2>
        </div>

        {activePlaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              활성화된 방이 있는 가게가 없습니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlaces.map((place) => (
              <Card
                key={place.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/places/${place.id}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-lg">
                      {place.name}
                    </h3>
                    <Badge variant="success">활성</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {place.address}
                  </p>
                </CardHeader>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        활성 방
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {getActiveRoomsCount(place)}개
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        참여 중
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {getTotalParticipants(place)}명
                      </span>
                    </div>
                    <Button
                      variant="primary"
                      className="w-full mt-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/places/${place.id}`);
                      }}
                    >
                      방 둘러보기
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
