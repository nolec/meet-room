/* Minimal service worker for offline cache */
const CACHE_NAME = "nerves-cache-v2";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", OFFLINE_URL]))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  // GET 요청이 아니면 캐시하지 않음
  if (request.method !== "GET") return;

  // 지원되지 않는 스키마 필터링
  const url = new URL(request.url);
  const unsupportedSchemes = [
    "chrome-extension",
    "chrome",
    "moz-extension",
    "safari-extension",
  ];

  if (unsupportedSchemes.includes(url.protocol.slice(0, -1))) {
    return; // 확장 프로그램 요청은 캐시하지 않음
  }

  // 외부 도메인 요청도 캐시하지 않음 (CORS 문제 방지)
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // 성공적인 응답만 캐시
        if (response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            try {
              cache.put(request, copy);
            } catch (error) {
              console.warn("캐시 저장 실패:", error);
            }
          });
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cached = await cache.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          return cache.match(OFFLINE_URL);
        }
        throw new Error("Network error and no cache");
      })
  );
});
