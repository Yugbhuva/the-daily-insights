export type UserRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author_id: string;
  author_name: string;
  category: string;
  tags: string[];
  image_url: string;
  status: 'published' | 'draft';
  views: number;
  likes_count: number;
  is_breaking?: boolean;
  is_trending?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  article_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  content: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Like {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
}

export interface Bookmark {
  id: string;
  article_id: string;
  user_id: string;
  created_at: string;
}

export interface AdConfig {
  id: string; // e.g., 'home_body_1'
  code: string;
  updated_at: string;
}
