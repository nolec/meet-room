"use client";

import { useTheme } from "@/hooks/useTheme";
import { Theme } from "@/types/theme";

export default function ThemeToggle() {
  const { theme, handleThemeChange, mounted } = useTheme();

  // 서버 사이드 렌더링 시 깜빡임 방지
  if (!mounted) {
    return <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="relative">
      <select
        value={theme}
        onChange={(event) => handleThemeChange(event.target.value as Theme)}
        className="appearance-none bg-background border border-border rounded-lg px-3 py-2 pr-8 text-sm focus:ring-2 focus:ring-ring focus:border-transparent"
        aria-label="테마 선택"
      >
        <option value="light">라이트</option>
        <option value="dark">다크</option>
        <option value="system">시스템</option>
      </select>

      {/* 드롭다운 화살표 */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
        <svg
          className="w-4 h-4 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}
