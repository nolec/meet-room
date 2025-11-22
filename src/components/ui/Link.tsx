"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { LinkProps } from "./types";

export function CustomLink({
  variant = "primary",
  className,
  children,
  href,
  underline = false,
  external = false,
  ...props
}: LinkProps) {
  const baseClasses = "font-medium transition-colors";

  const variantClasses = {
    primary:
      "text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300",
    secondary:
      "text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300",
    danger:
      "text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300",
    success:
      "text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300",
  };

  const underlineClasses = underline ? "underline hover:no-underline" : "";

  if (external) {
    return (
      <a
        href={href}
        className={cn(
          baseClasses,
          variantClasses[variant],
          underlineClasses,
          className
        )}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
        <svg
          className="inline-block w-3 h-3 ml-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        baseClasses,
        variantClasses[variant],
        underlineClasses,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
