"use client";

import { useError } from "@/contexts/ErrorContext";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { handleSupabaseError } = useError();

  useEffect(() => {
    // 현재 세션 확인
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // 인증 상태 변화 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        handleSupabaseError(error);
      }

      return { data, error };
    } catch (err) {
      handleSupabaseError(err);
      return { data: null, error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profileData?: {
      name?: string;
      age?: number | null;
      gender?: string | null;
      bio?: string | null;
      interests?: string[];
    }
  ) => {
    try {
      const name = profileData?.name || email.split("@")[0];
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) {
        handleSupabaseError(error);
        return { data, error };
      }

      // 회원가입 성공 시 프로필 생성 (실패해도 회원가입은 성공)
      if (data.user) {
        try {
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              email: data.user.email!,
              name: name || null,
              age: profileData?.age || null,
              gender: profileData?.gender || null,
              bio: profileData?.bio || null,
              interests: profileData?.interests || null,
            });

          if (profileError) {
            console.error("프로필 생성 실패:", profileError);
            // 프로필 생성 실패해도 회원가입은 성공으로 처리
          }

          // 사용자 설정도 생성
          const { error: preferencesError } = await supabase
            .from("user_preferences")
            .insert({
              user_id: data.user.id,
            });

          if (preferencesError) {
            console.error("사용자 설정 생성 실패:", preferencesError);
            // 사용자 설정 생성 실패해도 회원가입은 성공으로 처리
          }
        } catch (err) {
          console.error("프로필/설정 생성 중 오류:", err);
          // 오류가 발생해도 회원가입은 성공으로 처리
        }
      }

      return { data, error };
    } catch (err) {
      handleSupabaseError(err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
