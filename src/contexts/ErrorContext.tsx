"use client";

import { ErrorToast } from "@/components/ErrorToast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { AppError } from "@/types/error";
import { createContext, ReactNode, useContext } from "react";

interface ErrorContextType {
  addError: (error: AppError) => void;
  removeError: (errorId?: string) => void;
  clearErrors: () => void;
  createAndAddError: (
    type: AppError["type"],
    message: string,
    code?: string | number,
    details?: unknown
  ) => AppError;
  handleApiError: (error: unknown) => AppError;
  handleSupabaseError: (error: unknown) => AppError;
  currentError: AppError | null;
  errorState: {
    hasErrors: boolean;
    hasCurrentError: boolean;
    latestError: AppError | null;
    errorCount: number;
  };
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

interface ErrorProviderProps {
  children: ReactNode;
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const errorHandler = useErrorHandler({
    showToast: true,
    logToConsole: true,
  });

  return (
    <ErrorContext.Provider value={errorHandler}>
      {children}
      <ErrorToast
        error={errorHandler.currentError}
        onClose={() => errorHandler.removeError()}
      />
    </ErrorContext.Provider>
  );
}

export function useError() {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
}
