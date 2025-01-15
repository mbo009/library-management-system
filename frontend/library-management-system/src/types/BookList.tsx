import { Book } from "./Book";

export type Books = {
  borrowed: Book[];
  returned: Book[];
  queued: Book[];
};
