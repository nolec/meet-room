import { User } from "@supabase/supabase-js";

/**
 * 사용자의 이메일 인증 상태를 확인하는 유틸리티 함수들
 */

export function isEmailConfirmed(user: User | null): boolean {
  return (
    user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined
  );
}

export function getEmailConfirmationStatus(user: User | null): {
  isConfirmed: boolean;
  needsConfirmation: boolean;
  confirmationMessage: string;
} {
  const isConfirmed = isEmailConfirmed(user);

  return {
    isConfirmed,
    needsConfirmation: !isConfirmed,
    confirmationMessage: isConfirmed
      ? "이메일이 인증되었습니다."
      : "이메일 인증이 필요합니다. 이메일함을 확인해주세요.",
  };
}

export function shouldShowEmailConfirmationWarning(user: User | null): boolean {
  return !isEmailConfirmed(user) && process.env.NODE_ENV === "development";
}
