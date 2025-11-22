import { useEffect, useState } from "react";

/**
 * 컴포넌트가 클라이언트에서 마운트되었는지 확인하는 훅
 * SSR과 클라이언트 hydration 간의 불일치를 방지합니다.
 *
 * @returns {boolean} mounted - 컴포넌트가 마운트되었는지 여부
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mounted = useMounted();
 *
 *   if (!mounted) {
 *     return <div>Loading...</div>;
 *   }
 *
 *   return <div>Client-side content</div>;
 * }
 * ```
 */
export const useMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
