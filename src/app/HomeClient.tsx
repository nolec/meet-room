"use client";

import { Button, CustomLink } from "@/components/ui";
import { User } from "@supabase/supabase-js";

interface HomeClientProps {
  user: User | null;
}

export default function HomeClient({ user }: HomeClientProps) {
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* 히어로 섹션 */}
      <section className="relative py-32 md:py-40 bg-white dark:bg-black">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-tight text-black dark:text-white">
              {isLoggedIn ? (
                <>
                  안녕하세요
                  <br />
                  <span className="text-black dark:text-white">
                    {user.user_metadata?.name || user.email?.split("@")[0]}님
                  </span>
                </>
              ) : (
                "좌석에서 만나요"
              )}
            </h1>

            <p className="text-2xl md:text-3xl text-gray-600 dark:text-gray-400 mb-16 leading-relaxed font-light">
              {isLoggedIn
                ? "가게의 좌석별 방에서 실시간으로 대화하고, 마음에 드는 사람과 자연스럽게 연결되세요."
                : "가게의 좌석별로 만들어지는 실시간 채팅방에서 새로운 인연을 만나보세요."}
            </p>

            {/* 버튼 */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              {isLoggedIn ? (
                <>
                  <CustomLink href="/dashboard">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-12 py-6 text-xl font-medium bg-[#00D9A5] text-white hover:bg-[#00C896] transition-all duration-200 rounded-none"
                    >
                      가게 둘러보기
                    </Button>
                  </CustomLink>
                  <CustomLink href="/places/new">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-12 py-6 text-xl font-medium border-2 border-[#00D9A5] text-[#00D9A5] hover:bg-[#00D9A5] hover:text-white transition-all duration-200 rounded-none"
                    >
                      가게 등록하기
                    </Button>
                  </CustomLink>
                </>
              ) : (
                <>
                  <CustomLink href="/register">
                    <Button
                      variant="primary"
                      size="lg"
                      className="px-12 py-6 text-xl font-medium bg-[#00D9A5] text-white hover:bg-[#00C896] transition-all duration-200 rounded-none"
                    >
                      무료로 시작하기
                    </Button>
                  </CustomLink>
                  <CustomLink href="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-12 py-6 text-xl font-medium border-2 border-[#00D9A5] text-[#00D9A5] hover:bg-[#00D9A5] hover:text-white transition-all duration-200 rounded-none"
                    >
                      로그인
                    </Button>
                  </CustomLink>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 */}
      <section className="py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-black dark:text-white">
                새로운 인연의 시작
              </h2>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 font-light">
                좌석에서 만나는 자연스러운 커뮤니티
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {/* 좌석별 방 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#00D9A5] rounded-full flex items-center justify-center mb-8">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                  좌석별 방
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light max-w-sm mx-auto">
                  가게의 각 좌석마다 독립적인 채팅방이 있어요. 지금 앉은
                  자리에서 바로 시작할 수 있습니다.
                </p>
              </div>

              {/* 실시간 채팅 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#00D9A5] rounded-full flex items-center justify-center mb-8">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                  실시간 채팅
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light max-w-sm mx-auto">
                  타이핑하자마자 전달되는 메시지로 자연스럽게 대화해요.
                  텍스트만으로도 따뜻한 만남이 시작됩니다.
                </p>
              </div>

              {/* 마음 표현 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-[#00D9A5] rounded-full flex items-center justify-center mb-8">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-black dark:text-white mb-4">
                  마음 표현
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed font-light max-w-sm mx-auto">
                  마음에 드는 사람에게 관심을 표현하고, 서로 마음이 맞으면
                  연결될 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 빠른 액션 - 로그인된 사용자 */}
      {isLoggedIn && (
        <section className="py-32 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-5xl font-bold text-center mb-20 text-black dark:text-white">
                빠른 액션
              </h2>
              <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                <CustomLink href="/dashboard">
                  <div className="bg-white dark:bg-gray-900 border-2 border-[#00D9A5] p-12 text-center cursor-pointer hover:bg-[#00D9A5] hover:text-white transition-all duration-200 flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#00D9A5] rounded-full flex items-center justify-center mb-8">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">
                      가게 둘러보기
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                      주변 가게와 활성 방을 확인하세요
                    </p>
                  </div>
                </CustomLink>

                <CustomLink href="/places/new">
                  <div className="bg-white dark:bg-gray-900 border-2 border-[#00D9A5] p-12 text-center cursor-pointer hover:bg-[#00D9A5] hover:text-white transition-all duration-200 flex flex-col items-center">
                    <div className="w-20 h-20 bg-[#00D9A5] rounded-full flex items-center justify-center mb-8">
                      <svg
                        className="w-10 h-10 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">
                      가게 등록하기
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-400 font-light">
                      새로운 가게를 등록하고 방을 만들어보세요
                    </p>
                  </div>
                </CustomLink>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
