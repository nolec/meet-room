import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "좌석 - 실시간 커뮤니티",
    short_name: "좌석",
    description: "가게의 좌석별 방에서 실시간으로 대화하고 연결되는 커뮤니티 플랫폼",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0ea5e9",
    orientation: "portrait-primary",
    icons: [
      // 기본 아이콘 (favicon 사용)
      {
        src: "/favicon.ico",
        sizes: "16x16 32x32 48x48",
        type: "image/x-icon",
      },
      // 임시 아이콘 (나중에 실제 아이콘으로 교체)
      {
        src: "/favicon.ico",
        sizes: "192x192",
        type: "image/x-icon",
      },
      {
        src: "/favicon.ico",
        sizes: "512x512",
        type: "image/x-icon",
      },
    ],
  };
}
