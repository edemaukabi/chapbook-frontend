export interface User {
  pk: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  profile_photo: string;
  phone_number: string;
  gender: "M" | "F" | "O";
  country: string;
  city: string;
  twitter_handle: string;
  about_me: string;
}

export interface Comment {
  id: string;
  user_first_name: string;
  article_title: string;
  parent_response: string | null;
  content: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  tags: string[];
  estimated_reading_time: number;
  author_info: Profile;
  views: number;
  description: string;
  body: string;
  banner_image: string;
  average_rating: number | null;
  bookmarks_count: number;
  claps_count: number;
  responses_count: number;
  responses: Comment[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: unknown;
}
