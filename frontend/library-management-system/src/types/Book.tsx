import { Author } from "./Author";

export type Book = {
  bookID: number;
  authors: Array<Author>;
  genre_name: string;
  language_name: string;
  language_shortcut: string;
  title: string;
  description: string;
  isbn: string;
  published_date: string;
  page_count: number;
  total_copies: number;
  created_at: string;
  updated_at: string;
  genre: number;
  language: number;
  cover_url: string;
  expected_return_date: string | null;
};
