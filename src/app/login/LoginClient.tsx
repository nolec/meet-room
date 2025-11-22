"use client";

import { Alert, Button, CustomLink, Input } from "@/components/ui";
import { useError } from "@/contexts/ErrorContext";
import { useAuth } from "@/hooks/useAuth";
import { getEmailConfirmationStatus } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginClient() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);

  const { signIn } = useAuth();
  const { clearErrors } = useError();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    clearErrors(); // 이전 에러 제거

    try {
      const { data, error } = await signIn(formData.email, formData.password);

      if (!error && data?.user) {
        const { needsConfirmation } = getEmailConfirmationStatus(data.user);

        if (needsConfirmation) {
          setShowEmailConfirmation(true);
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            실시간 커뮤니티 플랫폼
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            로그인하고 새로운 인연을 만나보세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              name="email"
              type="email"
              label="이메일 주소"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              name="password"
              type="password"
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {showEmailConfirmation && (
            <Alert variant="warning" title="이메일 인증 필요">
              <div className="space-y-2">
                <p>이메일 인증이 필요합니다.</p>
                <p className="text-sm">
                  {formData.email}로 발송된 인증 메일을 확인해주세요.
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowEmailConfirmation(false)}
                  >
                    나중에
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      // 이메일 재발송 로직 (추후 구현)
                      console.log("이메일 재발송 요청");
                    }}
                  >
                    재발송
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              계정이 없으신가요?{" "}
              <CustomLink href="/register" variant="primary">
                회원가입하기
              </CustomLink>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
