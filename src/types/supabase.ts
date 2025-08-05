export interface Database {
  public: {
    Tables: {
      sessions: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          status: 'active' | 'expired';
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          status?: 'active' | 'expired';
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          status?: 'active' | 'expired';
        };
      };
    };
  };
}
