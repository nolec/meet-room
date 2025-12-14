import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 클래스명을 병합하고 중복을 제거하는 유틸리티 함수
 * clsx와 tailwind-merge를 결합하여 사용
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * URLSearchParams에서 정수 파라미터를 가져오는 헬퍼 함수
 * @param params URLSearchParams 객체
 * @param key 파라미터 키
 * @param defaultValue 기본값 (파라미터가 없거나 유효하지 않을 때)
 * @returns 파싱된 정수 값 또는 기본값
 */
export function getIntParam(
  params: URLSearchParams,
  key: string,
  defaultValue: number
): number {
  const value = params.get(key);
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
