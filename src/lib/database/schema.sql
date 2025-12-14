-- 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  age INTEGER,
  gender VARCHAR(20),
  interests TEXT[], -- 관심사 배열
  timezone VARCHAR(50) DEFAULT 'Asia/Seoul',
  language VARCHAR(10) DEFAULT 'ko',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 카페/가게 테이블
CREATE TABLE IF NOT EXISTS places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  address TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  category VARCHAR(50) CHECK (category IN ('cafe', 'restaurant', 'bar', 'library', 'co_working', 'other')),
  description TEXT,
  total_seats INTEGER DEFAULT 0,
  wifi_available BOOLEAN DEFAULT false,
  power_outlets BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id), -- 등록한 사용자
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 방 (Room) 테이블 - 각 카페의 좌석/공간별 방
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id UUID REFERENCES places(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL, -- 방 이름 (예: "창가 자리", "2층 테이블")
  seat_number VARCHAR(50), -- 좌석 번호
  description TEXT,
  max_participants INTEGER DEFAULT 4, -- 최대 참여 인원
  current_participants INTEGER DEFAULT 0, -- 현재 참여 인원
  is_active BOOLEAN DEFAULT true, -- 방이 활성화되어 있는지
  room_type VARCHAR(20) DEFAULT 'public' CHECK (room_type IN ('public', 'private', 'invite_only')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 방 참여자 테이블
CREATE TABLE IF NOT EXISTS room_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'left', 'removed')),
  UNIQUE(room_id, user_id)
);

-- 채팅 메시지 테이블
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 관심 표현 (Interest/Like) 테이블
CREATE TABLE IF NOT EXISTS interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE, -- 어떤 방에서 만났는지
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id, room_id)
);

-- 매칭 테이블 (양쪽 다 관심 표현한 경우)
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  interest1_id UUID REFERENCES interests(id), -- 첫 번째 관심 표현
  interest2_id UUID REFERENCES interests(id), -- 두 번째 관심 표현
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unmatched')),
  UNIQUE(user1_id, user2_id, room_id)
);

-- 신고 테이블
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_rooms_place_id ON rooms(place_id);
CREATE INDEX IF NOT EXISTS idx_rooms_is_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_room_participants_room_id ON room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user_id ON room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_interests_from_user ON interests(from_user_id);
CREATE INDEX IF NOT EXISTS idx_interests_to_user ON interests(to_user_id);
CREATE INDEX IF NOT EXISTS idx_interests_room_id ON interests(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_users ON matches(user1_id, user2_id);

-- RLS (Row Level Security) 정책
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE places ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- 프로필 RLS 정책
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can view other profiles" ON profiles;
CREATE POLICY "Users can view other profiles" ON profiles
  FOR SELECT USING (true); -- 모든 사용자 프로필 조회 가능

-- 카페/가게 RLS 정책
DROP POLICY IF EXISTS "Anyone can view places" ON places;
CREATE POLICY "Anyone can view places" ON places
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create places" ON places;
CREATE POLICY "Anyone can create places" ON places
  FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can update places" ON places;
CREATE POLICY "Creators can update places" ON places
  FOR UPDATE USING (auth.uid() = created_by);

DROP POLICY IF EXISTS "Creators can delete places" ON places;
CREATE POLICY "Creators can delete places" ON places
  FOR DELETE USING (auth.uid() = created_by);

-- 방 RLS 정책
DROP POLICY IF EXISTS "Anyone can view active rooms" ON rooms;
CREATE POLICY "Anyone can view active rooms" ON rooms
  FOR SELECT USING (is_active = true OR auth.uid() = created_by);

DROP POLICY IF EXISTS "Anyone can create rooms" ON rooms;
CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Creators can update rooms" ON rooms;
CREATE POLICY "Creators can update rooms" ON rooms
  FOR UPDATE USING (auth.uid() = created_by);

-- 방 참여자 RLS 정책
DROP POLICY IF EXISTS "Participants can view room participants" ON room_participants;
CREATE POLICY "Participants can view room participants" ON room_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = room_participants.room_id
      AND rp.user_id = auth.uid()
      AND rp.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Users can join rooms" ON room_participants;
CREATE POLICY "Users can join rooms" ON room_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave rooms" ON room_participants;
CREATE POLICY "Users can leave rooms" ON room_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- 채팅 메시지 RLS 정책
DROP POLICY IF EXISTS "Participants can view messages" ON messages;
CREATE POLICY "Participants can view messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = messages.room_id
      AND rp.user_id = auth.uid()
      AND rp.status = 'active'
    )
  );

DROP POLICY IF EXISTS "Participants can send messages" ON messages;
CREATE POLICY "Participants can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM room_participants rp
      WHERE rp.room_id = messages.room_id
      AND rp.user_id = auth.uid()
      AND rp.status = 'active'
    )
  );

-- 관심 표현 RLS 정책
DROP POLICY IF EXISTS "Users can view own interests" ON interests;
CREATE POLICY "Users can view own interests" ON interests
  FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

DROP POLICY IF EXISTS "Users can express interest" ON interests;
CREATE POLICY "Users can express interest" ON interests
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can update received interests" ON interests;
CREATE POLICY "Users can update received interests" ON interests
  FOR UPDATE USING (auth.uid() = to_user_id);

-- 매칭 RLS 정책
DROP POLICY IF EXISTS "Users can view own matches" ON matches;
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 신고 RLS 정책
DROP POLICY IF EXISTS "Users can report others" ON reports;
CREATE POLICY "Users can report others" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_user_id);

DROP POLICY IF EXISTS "Users can view own reports" ON reports;
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_user_id);
