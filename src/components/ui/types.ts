// 디자인 시스템의 기본 타입 정의
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type InputVariant = "default" | "error" | "success";
export type InputSize = "sm" | "md" | "lg";
export type LinkVariant = "primary" | "secondary" | "danger" | "success";

// 공통 Props 타입
export interface BaseComponentProps {
  name?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

// 버튼 Props
export interface ButtonProps extends BaseComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: "button" | "submit" | "reset";
  loading?: boolean;
  isLoading?: boolean; // alias for loading
  isError?: boolean;
  as?: React.ElementType;
  "aria-label"?: string;
  href?: string; // for Link component
}

// 입력 필드 Props
export interface InputProps extends BaseComponentProps {
  variant?: InputVariant;
  size?: InputSize;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "email" | "password" | "number" | "date";
  required?: boolean;
  label?: string;
  error?: string;
  id?: string;
}

// 링크 Props
export interface LinkProps extends BaseComponentProps {
  variant?: LinkVariant;
  href: string;
  underline?: boolean;
  external?: boolean;
}
