"use client";

import { Button, CustomLink, Input } from "@/components/ui";
import { useError } from "@/contexts/ErrorContext";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterClient() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    age: "",
    gender: "",
    bio: "",
    interests: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
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
    clearErrors(); // 이전 에러 제거
    setIsLoading(true);

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      // 에러는 ErrorContext에서 처리됨
      setIsLoading(false);
      return;
    }

    // 비밀번호 길이 확인
    if (formData.password.length < 6) {
      // 에러는 ErrorContext에서 처리됨
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(formData.email, formData.password, {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        gender: formData.gender || null,
        bio: formData.bio || null,
        interests: formData.interests,
      });

      if (!error) {
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Register error:", err);
      // 에러는 useAuth에서 ErrorContext로 전달됨
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            실시간 커뮤니티 플랫폼
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            회원가입하고 새로운 인연을 만들어보세요
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              name="name"
              type="text"
              label="이름"
              placeholder="홍길동"
              value={formData.name}
              onChange={handleChange}
              required
            />

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
              placeholder="6자 이상"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              name="confirmPassword"
              type="password"
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  나이 (선택)
                </label>
                <input
                  name="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                  className="input-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  성별 (선택)
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, gender: e.target.value }))
                  }
                  className="input-base"
                >
                  <option value="">선택 안 함</option>
                  <option value="male">남성</option>
                  <option value="female">여성</option>
                  <option value="other">기타</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                자기소개 (선택)
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                placeholder="간단한 자기소개를 작성해주세요"
                rows={3}
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                관심사 (선택, 여러 개 선택 가능)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  "독서",
                  "영화",
                  "음악",
                  "운동",
                  "여행",
                  "요리",
                  "게임",
                  "사진",
                  "공부",
                ].map((interest) => (
                  <label
                    key={interest}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={interest}
                      checked={formData.interests.includes(interest)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData((prev) => ({
                            ...prev,
                            interests: [...prev.interests, interest],
                          }));
                        } else {
                          setFormData((prev) => ({
                            ...prev,
                            interests: prev.interests.filter(
                              (i) => i !== interest
                            ),
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      {interest}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? "회원가입 중..." : "회원가입"}
            </Button>
          </div>

          <div className="text-center">
            <span className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
              <CustomLink href="/login" variant="primary">
                로그인하기
              </CustomLink>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
