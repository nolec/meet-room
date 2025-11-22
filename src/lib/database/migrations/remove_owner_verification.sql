-- 사업자 관련 필드 제거 마이그레이션
-- 실행 전 백업 권장

-- 1. owner_id 컬럼 제거 (있다면)
ALTER TABLE places DROP COLUMN IF EXISTS owner_id;

-- 2. is_verified 컬럼 제거 (있다면)
ALTER TABLE places DROP COLUMN IF EXISTS is_verified;

-- 3. created_by 컬럼 추가 (없다면)
ALTER TABLE places ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 4. 기존 데이터의 created_by 채우기 (owner_id가 있던 경우)
-- 주의: owner_id가 있었다면 이 쿼리를 사용하세요
-- UPDATE places SET created_by = owner_id WHERE owner_id IS NOT NULL AND created_by IS NULL;

-- 5. 기존 RLS 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Owners can update places" ON places;

-- 6. 새로운 RLS 정책 생성
CREATE POLICY "Anyone can create places" ON places
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Creators can update places" ON places
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Creators can delete places" ON places
  FOR DELETE USING (auth.uid() = created_by);

