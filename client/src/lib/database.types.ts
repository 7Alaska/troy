export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          image_path: string;
          image_url: string;
          thumbnail_url: string | null;
          mockup_url: string | null;
          sort_order: number;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          price?: number;
          image_path: string;
          image_url: string;
          thumbnail_url?: string | null;
          mockup_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          image_path?: string;
          image_url?: string;
          thumbnail_url?: string | null;
          mockup_url?: string | null;
          sort_order?: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      collection_images: {
        Row: {
          id: string;
          collection_id: string;
          image_path: string;
          image_url: string;
          sort_order: number;
          is_thumbnail: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          collection_id: string;
          image_path: string;
          image_url: string;
          sort_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          collection_id?: string;
          image_path?: string;
          image_url?: string;
          sort_order?: number;
          is_thumbnail?: boolean;
          created_at?: string;
        };
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string;
        };
      };
    };
  };
};
