import { Book } from "./Book";

export type Books = {
  currently_borrowed_books: Array<Book>;
  previously_borrowed_books: Array<Book>;
  queued_books: Array<Book>;
};
