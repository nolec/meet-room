"use client";

import { Children, forwardRef, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ButtonProps } from "./types";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      as: Component = "button",
      size = "md",
      variant = "primary",
      isLoading = false,
      loading = false,
      isError = false,
      disabled = false,
      className,
      children,
      onClick,
      type = "button",
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const loadingState = isLoading || loading;
    const hasIcon = false; // TODO: icon support
    const isSingleChild = useMemo(
      () => Boolean(Children.count(children) === 0) || !children,
      [children]
    );

    const ableState = useMemo(() => {
      return disabled ? "disabled" : "enabled";
    }, [disabled]);

    const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isProcessing) {
        event.preventDefault();
        return;
      }

      if (onClick && !isProcessing) {
        setIsProcessing(true);
        onClick(event);

        processingTimeoutRef.current = setTimeout(() => {
          setIsProcessing(false);
          processingTimeoutRef.current = null;
        }, 350);
      }
    };

    const baseClasses = cn(
      "relative inline-flex items-center justify-center font-semibold",
      "transition-all duration-200 ease-in-out",
      "focus:outline-none",
      "disabled:cursor-not-allowed",
      "whitespace-nowrap",
      "[word-break:keep-all]",
      "no-underline",
      "[&:hover]:no-underline",
      "[&:visited]:no-underline"
    );

    const variantClasses = {
      primary: cn(
        "text-white bg-primary",
        "hover:bg-[var(--primary-hover)]",
        "active:bg-[var(--primary-hover)]",
        "[&:visited]:!text-white",
        "[&:hover]:!text-white",
        "disabled:text-gray-400 disabled:bg-gray-100",
        loadingState && "disabled:!text-white disabled:!bg-primary/60",
        isError && "outline outline-1 outline-red-700 outline-offset-[-1px] !important"
      ),
      secondary: cn(
        "text-primary bg-[var(--secondary)]",
        "hover:bg-gray-200",
        "active:bg-gray-300",
        "disabled:text-gray-400 disabled:bg-gray-100",
        isError && "outline outline-1 outline-red-700 outline-offset-[-1px] !important"
      ),
      outline: cn(
        "text-foreground bg-background",
        "outline outline-1 outline-[var(--border)] outline-offset-[-1px]",
        "hover:bg-gray-50 hover:outline-[var(--border)]",
        "active:bg-gray-100 active:outline-[var(--border)]",
        "disabled:text-gray-400 disabled:bg-white disabled:outline-gray-100",
        isError && "outline outline-1 outline-red-700 outline-offset-[-1px] !important"
      ),
      ghost: cn(
        "text-foreground bg-transparent",
        "hover:bg-gray-100",
        "active:bg-gray-200",
        "disabled:text-gray-400"
      ),
      danger: cn(
        "text-white bg-[var(--destructive)]",
        "hover:bg-red-800",
        "active:bg-red-900",
        "disabled:text-gray-400 disabled:bg-gray-100"
      ),
      success: cn(
        "text-white bg-green-600",
        "hover:bg-green-700",
        "active:bg-green-800",
        "disabled:text-gray-400 disabled:bg-gray-100"
      ),
    };

    const sizeClasses = {
      sm: "h-[30px] min-h-[30px] px-[6px] text-sm rounded-md",
      md: "h-[38px] min-h-[38px] px-2 text-base rounded-lg",
      lg: "h-[44px] min-h-[44px] px-3 text-lg rounded-lg",
      xl: "h-[52px] min-h-[52px] px-4 text-xl rounded-lg",
    };

    const renderContent = () => {
      if (loadingState) {
        return (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-label={ariaLabel}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {children && (
              <span
                className="max-w-full overflow-hidden text-ellipsis"
                aria-label={ariaLabel}
              >
                {children}
              </span>
            )}
          </>
        );
      }

      if (isSingleChild && hasIcon) {
        // TODO: Render icon only
        return <span aria-label={ariaLabel}>{children}</span>;
      }

      if (hasIcon) {
        return (
          <>
            {/* TODO: Left icon */}
            <span
              className="max-w-full overflow-hidden text-ellipsis"
              aria-label={ariaLabel}
            >
              {children}
            </span>
            {/* TODO: Right icon */}
          </>
        );
      }

      return (
        <span
          className="max-w-full overflow-hidden text-ellipsis"
          aria-label={ariaLabel}
        >
          {children}
        </span>
      );
    };

    return (
      <Component
        ref={ref}
        type={Component === "button" ? type : undefined}
        data-state={ableState}
        disabled={disabled || loadingState}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        aria-label={ariaLabel}
        onClick={handleClick}
        {...props}
      >
        {renderContent()}
      </Component>
    );
  }
);

Button.displayName = "Button";
