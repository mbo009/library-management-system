import { Book } from "./Book";

export type BookList = {
  borrowed: Book[];
  returned: Book[];
  queued: Book[];
};
