import { Book } from "./Book.tsx";

export type UserProfile = {
  user_id: number;
  e_mail: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  is_librarian: boolean;
  last_login: string;
  borrowed_books: Array<Book>;
};
