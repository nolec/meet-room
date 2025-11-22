-- 임시 디버깅용 SQL
-- 1. profiles 테이블 RLS 비활성화 (임시)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. user_preferences 테이블 RLS 비활성화 (임시)
ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;

-- 3. 현재 정책 상태 확인
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'user_preferences');

-- 4. 테스트 후 다시 활성화하려면:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
