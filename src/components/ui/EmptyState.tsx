"use client";

import { Button } from "./Button";
import { BaseComponentProps } from "./types";
import { useRouter } from "next/navigation";

interface EmptyStateProps extends BaseComponentProps {
  message: string;
  title?: string;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  homeButtonText?: string;
  backButtonText?: string;
  homeHref?: string;
  onHomeClick?: () => void;
  onBackClick?: () => void;
}

export function EmptyState({
  message,
  title,
  showHomeButton = true,
  showBackButton = true,
  homeButtonText = "홈으로 가기",
  backButtonText = "뒤로 가기",
  homeHref = "/dashboard",
  onHomeClick,
  onBackClick,
  className,
}: EmptyStateProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.back();
    }
  };

  const handleHome = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      router.push(homeHref);
    }
  };

  return (
    <div
      className={`full-center container mx-auto max-w-7xl px-4 py-8 ${className || ""}`}
    >
      <div className="text-center py-12">
        {title && (
          <h2 className="text-2xl font-bold text-foreground mb-4">{title}</h2>
        )}
        <p className="text-muted-foreground mb-8">{message}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {showBackButton && (
            <Button variant="outline" onClick={handleBack}>
              {backButtonText}
            </Button>
          )}
          {showHomeButton && (
            <Button variant="primary" onClick={handleHome}>
              {homeButtonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
