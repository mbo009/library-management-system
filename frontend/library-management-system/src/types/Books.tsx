import { Book } from "./Book";

export type BookList = {
  currently_borrowed_books: Book[];
  previously_borrowed_books: Book[];
  queued_books: Book[];
};
