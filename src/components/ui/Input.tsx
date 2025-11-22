"use client";

import { cn } from "@/lib/utils";
import { useId } from "react";
import { InputProps } from "./types";

export function Input({
  variant = "default",
  size = "md",
  className,
  placeholder,
  value,
  onChange,
  type = "text",
  required = false,
  label,
  error,
  disabled,
  id,
  name,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || name || generatedId;

  const baseClasses =
    "block w-full border rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variantClasses = {
    default:
      "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500",
    error:
      "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500",
    success:
      "border-green-300 dark:border-green-600 focus:ring-green-500 focus:border-green-500",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-sm",
    lg: "px-4 py-3 text-base",
  };

  return (
    <div className="space-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <input
        id={inputId}
        name={name}
        type={type}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        {...props}
      />

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
