"use client";

import { cn } from "@/lib/utils";
import { BaseComponentProps } from "./types";

export type BadgeVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

interface BadgeProps extends BaseComponentProps {
  variant?: BadgeVariant;
}

export function Badge({
  variant = "primary",
  className,
  children,
  ...props
}: BadgeProps) {
  const baseClasses =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

  const variantClasses = {
    primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    secondary:
      "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  };

  return (
    <span
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
