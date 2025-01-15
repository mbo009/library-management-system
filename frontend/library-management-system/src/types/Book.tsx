export type Book = {
  id: number;
  title: string;
  authors: string[];
  genre: string;
  isbn: string;
  description: string | null;
  page_count: number | null;
  published_date: string | null;
  created_at: string;
  updated_at: string;
};
