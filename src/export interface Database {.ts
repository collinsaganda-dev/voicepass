export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          created_at: string;
          room_code: string;
          name: string;
          status: 'active' | 'ended';
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          room_code: string;
          name: string;
          status?: 'active' | 'ended';
          user_id: string;
        };
        Update: {
          room_code?: string;
          name?: string;
          status?: 'active' | 'ended';
        };
      };
      participants: {
        Row: {
          id: string;
          created_at: string;
          session_id: string;
          user_id: string;
          status: 'waiting' | 'active' | 'removed';
        };
        Insert: {
          session_id: string;
          user_id: string;
          status?: 'waiting' | 'active' | 'removed';
        };
        Update: {
          status?: 'waiting' | 'active' | 'removed';
        };
      };
    };
  };
}
