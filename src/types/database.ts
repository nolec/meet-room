// 프로필 타입 정의
export interface Profile {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;
  interests: string[] | null;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

// 카페/가게 타입 정의
export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  category: "cafe" | "restaurant" | "bar" | "library" | "co_working" | "other";
  description: string | null;
  total_seats: number;
  wifi_available: boolean;
  power_outlets: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// 방 타입 정의
export interface Room {
  id: string;
  place_id: string;
  name: string;
  seat_number: string | null;
  description: string | null;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  room_type: "public" | "private" | "invite_only";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// 방 참여자 타입 정의
export interface RoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  joined_at: string;
  last_active_at: string;
  status: "active" | "left" | "removed";
}

// 채팅 메시지 타입 정의
export interface Message {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "image" | "system";
  created_at: string;
}

// 관심 표현 타입 정의
export interface Interest {
  id: string;
  from_user_id: string;
  to_user_id: string;
  room_id: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  created_at: string;
  updated_at: string;
}

// 매칭 타입 정의
export interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  room_id: string;
  interest1_id: string | null;
  interest2_id: string | null;
  matched_at: string;
  status: "active" | "unmatched";
}

// 신고 타입 정의
export interface Report {
  id: string;
  reported_user_id: string;
  reporter_user_id: string;
  room_id: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  created_at: string;
}

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      places: {
        Row: Place;
        Insert: Omit<Place, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Place, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at" | "updated_at" | "current_participants"> & {
          id?: string;
          current_participants?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Room, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      room_participants: {
        Row: RoomParticipant;
        Insert: Omit<RoomParticipant, "id" | "joined_at" | "last_active_at"> & {
          id?: string;
          joined_at?: string;
          last_active_at?: string;
        };
        Update: Partial<Omit<RoomParticipant, "id" | "joined_at">> & {
          last_active_at?: string;
        };
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Message, "id" | "created_at">>;
      };
      interests: {
        Row: Interest;
        Insert: Omit<Interest, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Interest, "id" | "created_at">> & {
          updated_at?: string;
        };
      };
      matches: {
        Row: Match;
        Insert: Omit<Match, "id" | "matched_at"> & {
          id?: string;
          matched_at?: string;
        };
        Update: Partial<Omit<Match, "id" | "matched_at">>;
      };
      reports: {
        Row: Report;
        Insert: Omit<Report, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Report, "id" | "created_at">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// 편의 타입들
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export type PlaceInsert = Database["public"]["Tables"]["places"]["Insert"];
export type PlaceUpdate = Database["public"]["Tables"]["places"]["Update"];

export type RoomInsert = Database["public"]["Tables"]["rooms"]["Insert"];
export type RoomUpdate = Database["public"]["Tables"]["rooms"]["Update"];

export type RoomParticipantInsert = Database["public"]["Tables"]["room_participants"]["Insert"];
export type RoomParticipantUpdate = Database["public"]["Tables"]["room_participants"]["Update"];

export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export type InterestInsert = Database["public"]["Tables"]["interests"]["Insert"];
export type InterestUpdate = Database["public"]["Tables"]["interests"]["Update"];

export type MatchInsert = Database["public"]["Tables"]["matches"]["Insert"];
export type MatchUpdate = Database["public"]["Tables"]["matches"]["Update"];

export type ReportInsert = Database["public"]["Tables"]["reports"]["Insert"];
export type ReportUpdate = Database["public"]["Tables"]["reports"]["Update"];
