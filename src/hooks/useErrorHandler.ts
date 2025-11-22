import { AppError, createError, ErrorType } from "@/types/error";
import { useCallback, useMemo, useState } from "react";

interface UseErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  onError?: (error: AppError) => void;
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { logToConsole = true, onError } = options;

  const [errors, setErrors] = useState<AppError[]>([]);
  const [currentError, setCurrentError] = useState<AppError | null>(null);

  // 에러 추가
  const addError = useCallback(
    (error: AppError) => {
      setErrors((prev) => [...prev, error]);
      setCurrentError(error);

      if (logToConsole) {
        console.error("App Error:", error);
      }

      if (onError) {
        onError(error);
      }
    },
    [logToConsole, onError]
  );

  // 에러 제거
  const removeError = useCallback((errorId?: string) => {
    if (errorId) {
      setErrors((prev) => prev.filter((error) => error.code !== errorId));
    } else {
      setCurrentError(null);
    }
  }, []);

  // 모든 에러 제거
  const clearErrors = useCallback(() => {
    setErrors([]);
    setCurrentError(null);
  }, []);

  // 에러 생성 헬퍼
  const createAndAddError = useCallback(
    (
      type: ErrorType,
      message: string,
      code?: string | number,
      details?: unknown
    ) => {
      const error = createError(type, message, code, details);
      addError(error);
      return error;
    },
    [addError]
  );

  // API 에러 처리
  const handleApiError = useCallback(
    (error: unknown) => {
      let appError: AppError;

      // Axios 에러인지 확인
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response: { status: number; data: { message?: string } };
        };
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        switch (status) {
          case 400:
            appError = createError(
              "validation",
              data.message || "잘못된 요청입니다.",
              status
            );
            break;
          case 401:
            appError = createError(
              "auth",
              data.message || "인증이 필요합니다.",
              status
            );
            break;
          case 403:
            appError = createError(
              "auth",
              data.message || "권한이 없습니다.",
              status
            );
            break;
          case 404:
            appError = createError(
              "server",
              data.message || "요청한 리소스를 찾을 수 없습니다.",
              status
            );
            break;
          case 409:
            appError = createError(
              "server",
              data.message || "이미 존재하는 데이터입니다.",
              status
            );
            break;
          case 500:
            appError = createError(
              "server",
              data.message || "서버 내부 오류가 발생했습니다.",
              status
            );
            break;
          default:
            appError = createError(
              "server",
              data.message || "서버 오류가 발생했습니다.",
              status
            );
        }
      } else if (error && typeof error === "object" && "request" in error) {
        // 네트워크 오류
        appError = createError(
          "network",
          "네트워크 연결을 확인해주세요.",
          "NETWORK_ERROR"
        );
      } else {
        // 기타 오류
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        appError = createError("unknown", errorMessage);
      }

      addError(appError);
      return appError;
    },
    [addError]
  );

  // Supabase 에러 처리
  const handleSupabaseError = useCallback(
    (error: unknown) => {
      let appError: AppError;

      if (error && typeof error === "object" && "code" in error) {
        const supabaseError = error as { code: string; message: string };

        switch (supabaseError.code) {
          case "invalid_credentials":
            appError = createError(
              "auth",
              "이메일 또는 비밀번호가 올바르지 않습니다.",
              supabaseError.code
            );
            break;
          case "user_not_found":
            appError = createError(
              "auth",
              "사용자를 찾을 수 없습니다.",
              supabaseError.code
            );
            break;
          case "email_not_confirmed":
            appError = createError(
              "auth",
              "이메일 인증이 필요합니다.",
              supabaseError.code
            );
            break;
          case "weak_password":
            appError = createError(
              "validation",
              "비밀번호가 너무 약합니다.",
              supabaseError.code
            );
            break;
          case "email_address_invalid":
            appError = createError(
              "validation",
              "올바른 이메일 형식이 아닙니다.",
              supabaseError.code
            );
            break;
          default:
            appError = createError(
              "unknown",
              supabaseError.message || "알 수 없는 오류가 발생했습니다.",
              supabaseError.code
            );
        }
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.";
        appError = createError("unknown", errorMessage);
      }

      addError(appError);
      return appError;
    },
    [addError]
  );

  // 에러 상태 계산
  const errorState = useMemo(
    () => ({
      hasErrors: errors.length > 0,
      hasCurrentError: currentError !== null,
      latestError: errors[errors.length - 1] || null,
      errorCount: errors.length,
    }),
    [errors, currentError]
  );

  return {
    // 상태
    errors,
    currentError,
    errorState,

    // 액션
    addError,
    removeError,
    clearErrors,
    createAndAddError,
    handleApiError,
    handleSupabaseError,
  };
}
