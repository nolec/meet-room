"use client";

import { cn } from "@/lib/utils";
import { BaseComponentProps } from "./types";

interface CardProps extends BaseComponentProps {
  hover?: boolean;
  interactive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

interface CardHeaderProps extends BaseComponentProps {}

interface CardBodyProps extends BaseComponentProps {}

interface CardFooterProps extends BaseComponentProps {}

export function Card({
  className,
  children,
  hover = false,
  interactive = false,
  ...props
}: CardProps) {
  const baseClasses = "bg-background shadow rounded-lg";
  const hoverClasses = hover ? "hover:shadow-md transition-shadow" : "";
  const interactiveClasses = interactive
    ? "hover:shadow-md transition-all cursor-pointer hover:scale-[1.02]"
    : "";

  return (
    <div
      className={cn(baseClasses, hoverClasses, interactiveClasses, className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn("px-4 py-5 sm:px-6 border-b border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: CardBodyProps) {
  return (
    <div className={cn("px-4 py-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn("px-4 py-4 sm:px-6 border-t border-border", className)}
      {...props}
    >
      {children}
    </div>
  );
}
