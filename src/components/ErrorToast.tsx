"use client";

import { Alert } from "@/components/ui";
import { AppError } from "@/types/error";
import { useEffect, useState } from "react";

interface ErrorToastProps {
  error: AppError | null;
  onClose: () => void;
  duration?: number;
}

export function ErrorToast({
  error,
  onClose,
  duration = 5000,
}: ErrorToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (error) {
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // 애니메이션 완료 후 제거
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [error, duration, onClose]);

  if (!error || !isVisible) return null;

  const getAlertVariant = (type: AppError["type"]) => {
    switch (type) {
      case "auth":
        return "warning";
      case "validation":
        return "error";
      case "network":
        return "warning";
      case "server":
        return "error";
      case "success":
        return "success";
      case "info":
        return "info";
      default:
        return "error";
    }
  };

  const getErrorTitle = (type: AppError["type"]) => {
    switch (type) {
      case "auth":
        return "인증 오류";
      case "validation":
        return "입력 오류";
      case "network":
        return "네트워크 오류";
      case "server":
        return "서버 오류";
      case "success":
        return "성공";
      case "info":
        return "정보";
      default:
        return "오류";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert
        variant={getAlertVariant(error.type)}
        title={getErrorTitle(error.type)}
        className="shadow-lg"
      >
        <div className="space-y-2">
          <p className="text-sm">{error.message}</p>
          {error.code && (
            <p className="text-xs opacity-75">오류 코드: {error.code}</p>
          )}
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </Alert>
    </div>
  );
}
