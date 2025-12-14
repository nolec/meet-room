"use client";

import { Button } from "@/components/ui";
import { User } from "@supabase/supabase-js";
import Link from "next/link";

interface HomeClientProps {
  user: User | null;
}

export default function HomeClient({ user }: HomeClientProps) {
  const isLoggedIn = !!user;

  return (
    <div className="h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* 히어로 섹션 - 넷플릭스 스타일 */}
      <section className="relative h-full flex items-center justify-center">
        {/* 배경 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-0"></div>
        
        <div className="relative z-10 w-full max-w-4xl mx-auto px-6">
          <div className="text-center flex flex-col items-center justify-center space-y-2">
            {/* 메인 헤드라인 */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">
              {isLoggedIn ? (
                <>
                  <span className="text-foreground">안녕하세요,</span>
                  <br />
                  <span className="text-primary">
                    {user.user_metadata?.name || user.email?.split("@")[0]}님
                  </span>
                </>
              ) : (
                <span className="text-primary">좌석에서 만나요</span>
              )}
            </h1>

            {/* 서브헤드라인 */}
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto text-center leading-normal">
              {isLoggedIn
                ? "가게의 좌석별 방에서 실시간으로 대화하고, 마음에 드는 사람과 자연스럽게 연결되세요."
                : "가게의 좌석별로 만들어지는 실시간 채팅방에서 새로운 인연을 만나보세요."}
            </p>
          </div>

          {/* CTA 영역 - 넷플릭스 스타일 */}
          {!isLoggedIn ? (
            <div className="text-center flex flex-col items-center justify-center space-y-2 mt-3">
              <p className="text-xs md:text-sm text-muted-foreground text-center">
                시작할 준비가 되셨나요?
              </p>
              <Button
                as={Link}
                href="/login"
                variant="primary"
                size="lg"
              >
                시작하기
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-3">
              <Button
                as={Link}
                href="/dashboard"
                variant="primary"
                size="lg"
                className="min-w-[180px]"
              >
                가게 둘러보기
              </Button>
              <Button
                as={Link}
                href="/places/new"
                variant="outline"
                size="lg"
                className="min-w-[180px] btn-outline-primary"
              >
                가게 등록하기
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
