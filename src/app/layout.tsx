import ThemeToggle from "@/components/theme-toggle";
import { ErrorProvider } from "@/contexts/ErrorContext";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "좌석 - 실시간 커뮤니티 플랫폼",
  description:
    "가게의 좌석별 방에서 실시간으로 대화하고, 마음에 드는 사람과 연결되는 커뮤니티 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorProvider>
          {/* 헤더 */}
          <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center justify-between">
              <Link href="/" className="hover:decoration-none">
                <h1 className="text-xl font-bold text-foreground">너브스</h1>
              </Link>
              <ThemeToggle />
            </div>
          </header>

          {/* 메인 콘텐츠 */}
          <main className="bg-background">{children}</main>
        </ErrorProvider>

        <Script src="/common/register-sw.js" />
      </body>
    </html>
  );
}
