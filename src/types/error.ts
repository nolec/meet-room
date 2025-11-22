// 에러 타입 정의
export type ErrorType =
  | "network" // 네트워크 오류
  | "auth" // 인증 오류
  | "validation" // 유효성 검사 오류
  | "server" // 서버 오류
  | "success" // 성공 메시지
  | "info" // 정보 메시지
  | "unknown"; // 알 수 없는 오류

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string | number;
  details?: unknown;
  timestamp: Date;
}

// 에러 생성 헬퍼 함수
export function createError(
  type: ErrorType,
  message: string,
  code?: string | number,
  details?: unknown
): AppError {
  return {
    type,
    message,
    code,
    details,
    timestamp: new Date(),
  };
}

// 에러 타입별 메시지 매핑
export const ERROR_MESSAGES = {
  network: {
    timeout: "요청 시간이 초과되었습니다.",
    offline: "인터넷 연결을 확인해주세요.",
    server_unavailable: "서버에 연결할 수 없습니다.",
  },
  auth: {
    invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    user_not_found: "사용자를 찾을 수 없습니다.",
    session_expired: "세션이 만료되었습니다. 다시 로그인해주세요.",
    unauthorized: "권한이 없습니다.",
  },
  validation: {
    required_field: "필수 입력 항목입니다.",
    invalid_email: "올바른 이메일 형식이 아닙니다.",
    password_mismatch: "비밀번호가 일치하지 않습니다.",
    min_length: "최소 길이를 만족하지 않습니다.",
  },
  server: {
    internal_error: "서버 내부 오류가 발생했습니다.",
    bad_request: "잘못된 요청입니다.",
    not_found: "요청한 리소스를 찾을 수 없습니다.",
    conflict: "이미 존재하는 데이터입니다.",
  },
  unknown: {
    default: "알 수 없는 오류가 발생했습니다.",
  },
} as const;
