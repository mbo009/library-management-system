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
  created_at: string;
  updated_at: string;
  total_copies: number;
  reserved_copies: number;
  borrowed_copies: number;
  genre: number;
  language: number;
};
