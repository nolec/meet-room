"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
} from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { PlaceSearchResult } from "@/services/kakaoLocalService";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("브라우저가 위치 정보를 지원하지 않습니다.");
      setLoading(false);
      return;
    }

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
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyPlaces = async () => {
      try {
        setLoading(true);
        setCurrentPage(1);
        const response = await fetch(
          `/api/places/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&page=1`
        );

        if (!response.ok) throw new Error("주변 가게를 불러올 수 없습니다.");

        const data = await response.json();
        setNearbyPlaces(data.places || []);
        setHasMore(!data.isEnd);
      } catch (error) {
        console.error("주변 가게 가져오기 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNearbyPlaces();
  }, [userLocation]);

  const fetchMorePlaces = async () => {
    if (!userLocation || isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await fetch(
        `/api/places/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&page=${nextPage}`
      );

      if (!response.ok) throw new Error("주변 가게를 불러올 수 없습니다.");

      const data = await response.json();
      setNearbyPlaces((prev) => [...prev, ...(data.places || [])]);
      setHasMore(!data.isEnd);
      setCurrentPage(nextPage);
    } catch (error) {
      console.error("더 많은 가게 가져오기 실패:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const fetchActivePlaces = async () => {
      try {
        const response = await fetch("/api/places?limit=50");
        if (!response.ok) throw new Error("가게 목록을 불러올 수 없습니다.");

        const data = await response.json();
        const placesWithActiveRooms = (data.places || []).filter(
          (place: PlaceWithRooms) =>
            place.rooms?.some(
              (room) => room.is_active && room.current_participants > 0
            )
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
    return distance < 1
      ? `${Math.round(distance * 1000)}m`
      : `${distance.toFixed(1)}km`;
  };

  const getActiveRoomsCount = (place: PlaceWithRooms): number =>
    place.rooms?.filter(
      (room) => room.is_active && room.current_participants > 0
    ).length || 0;

  const getTotalParticipants = (place: PlaceWithRooms): number =>
    place.rooms?.reduce(
      (sum, room) => sum + (room.is_active ? room.current_participants : 0),
      0
    ) || 0;

  const handlePlaceClick = (e: React.MouseEvent, placeId: string) => {
    e.preventDefault();
    router.push(`/places/${placeId}`);
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex-1">
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

      <div className="space-y-6 mb-12">
        <h2 className="text-2xl font-bold text-foreground">
          활성화된 방이 있는 가게
        </h2>

        {activePlaces.length === 0 ? (
          <EmptyState
            message="현재 활성화된 방이 있는 가게가 없습니다."
            showBackButton={false}
            showHomeButton={false}
            className="py-8"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePlaces.map((place) => (
              <Card
                key={place.id}
                onClick={(e) => handlePlaceClick(e, place.id)}
                interactive
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
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-foreground">내 주변 가게</h2>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">가게 정보를 불러오는 중...</p>
          </div>
        ) : locationError ? (
          <EmptyState
            title="위치 정보 오류"
            message={`${locationError}\n위치 정보 접근 권한을 허용해주세요.`}
            showBackButton={false}
            showHomeButton={false}
            className="py-8"
          />
        ) : nearbyPlaces.length === 0 ? (
          <EmptyState
            message="주변에 가게가 없습니다."
            showBackButton={false}
            showHomeButton={false}
            className="py-8"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {nearbyPlaces.map((place) => (
                <Card
                  key={place.id}
                  onClick={(e) => handlePlaceClick(e, place.id)}
                  interactive
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
                </Card>
              ))}
            </div>
            {hasMore && (
              <div className="text-center py-8">
                <Button
                  variant="outline"
                  onClick={fetchMorePlaces}
                  disabled={isLoadingMore}
                >
                  {isLoadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2 inline-block"></div>
                      불러오는 중...
                    </>
                  ) : (
                    "더보기"
                  )}
                </Button>
              </div>
            )}
            {!hasMore && nearbyPlaces.length > 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  모든 가게를 불러왔습니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
