import {
  Box,
  CircularProgress,
  Paper,
  Tab,
  Tabs,
  List,
  ListItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Books } from "./types/BookList";
import { Book } from "./types/Book";

interface BookListProps {
  books: Books;
  booksLoading: boolean;
}

const BookList = ({ books, booksLoading }: BookListProps) => {
  const [tab, setTab] = useState<number>(0);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: number
  ): void => {
    setTab(newValue);
  };

  const renderBooks = (
    booksArr: Array<Book> = [],
    emptyMessage: string
  ): JSX.Element => {
    if (booksArr.length === 0) {
      return (
        <Box
          alignItems="center"
          justifyContent="center"
          display="flex"
          flexDirection="column"
          flexGrow={1}
        >
          <Typography marginTop={2}>{emptyMessage}</Typography>
        </Box>
      );
    }
    return (
      <List>
        {booksArr.map((book) => (
          <ListItem key={book.id}>{book.title}</ListItem>
        ))}
      </List>
    );
  };

  return (
    <Paper
      elevation={20}
      sx={{
        height: "100%",
        padding: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Tabs
        value={tab}
        onChange={handleTabChange}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="secondary"
      >
        <Tab label="Borrowed" />
        <Tab label="Returned" />
        <Tab label="Queued" />
      </Tabs>
      {booksLoading ? (
        <Box
          marginTop={2}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1,
          }}
          overflow={"hidden"}
        >
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flexGrow: 1 }}>
          {tab === 0 && (
            <Box sx={{ height: "100%" }}>
              {renderBooks(books.borrowed, "You didn't borrow any book yet!")}
            </Box>
          )}
          {tab === 1 && (
            <Box sx={{ height: "100%" }}>
              {renderBooks(
                books.returned,
                "You haven't returned any book yet!"
              )}
            </Box>
          )}
          {tab === 2 && (
            <Box sx={{ height: "100%" }}>
              {renderBooks(
                books.queued,
                "You haven't queued for any book yet!"
              )}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default BookList;
