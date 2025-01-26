import {
  Box,
  Divider,
  List,
  ListItem,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { UserProfile } from "./types/UserProfile";
import React, { useState } from "react";

type UserDetailsProps = {
  userData: UserProfile;
};

const issueBook = async (bookID: number, userID: number) => {
  try {
    console.log("Issuing book:", bookID);
    const response = await fetch("http://localhost:8000/api/borrow-book/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include",
      body: JSON.stringify({ book_id: bookID, user_id: userID }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Book issue response:", data);
    return data;
  } catch (error) {
    console.error("Error issuing the book:", error);
    throw error;
  }
};

const returnBook = async (bookID: number, userID: number) => {
  try {
    console.log("Returning book:", bookID);
    const response = await fetch("http://localhost:8000/api/return-book/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // credentials: "include",
      body: JSON.stringify({ book_id: bookID, user_id: userID }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();
    console.log("Book return response:", data);
    return data;
  } catch (error) {
    console.error("Error returning the book:", error);
    throw error;
  }
}

const UserDetails: React.FC<UserDetailsProps> = ({ userData }) => {
  const [localUserData, setLocalUserData] = useState<UserProfile>(userData);
  console.log(userData);
  const handleIssueBook = async (bookID: number) => {
    try {

      await issueBook(bookID, localUserData.user_id);

      setLocalUserData((prev) => {
        const justIssuedBook = prev.queued_books.find(
          (bk) => bk.bookID === bookID
        );
        if (!justIssuedBook) return prev;

        return {
          ...prev,

          queued_books: prev.queued_books.filter(
            (bk) => bk.bookID !== bookID
          ),

          borrowed_books: [...prev.borrowed_books, justIssuedBook],
        };
      });
    } catch (error) {
      console.error("Issue book error:", error);
    }
  };
  const handleReturnBook = async (bookID: number) => {
    try {
      await returnBook(bookID, localUserData.user_id);

      setLocalUserData((prev) => {
        const justReturnedBook = prev.borrowed_books.find(
          (bk) => bk.bookID === bookID
        );
        if (!justReturnedBook) return prev;

        return {
          ...prev,

          borrowed_books: prev.borrowed_books.filter(
            (bk) => bk.bookID !== bookID
          ),
        };
      });
    } catch (error) {
      console.error("Return book error:", error);
    }
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Divider>User Details</Divider>
      <Box
        paddingTop={1}
        paddingBottom={1}
        alignItems="center"
        display="flex"
        flexDirection="column"
      >
        <Typography variant="h5">
          {localUserData.first_name} {localUserData.last_name}
        </Typography>
      </Box>
      <Typography>{localUserData.email}</Typography>
      <Typography>{localUserData.phone_number}</Typography>

      <Divider sx={{ marginTop: 2 }}>Borrowed Books</Divider>
      {localUserData.borrowed_books.length === 0 ? (
        <Typography>User has no borrowed books.</Typography>
      ) : (
        localUserData.borrowed_books.map((book) => (
          <List key={book.bookID} sx={{ padding: 1 }}>
            <ListItem>
              <Stack direction="row" spacing={2}>
                <Typography>{book.title}</Typography>
                <Button onClick={() => handleReturnBook(book.bookID)}>Return book</Button>
              </Stack>
            </ListItem>
          </List>
        ))
      )}

      <Divider sx={{ marginTop: 2 }}>Reserved Books</Divider>
      {localUserData.queued_books.length === 0 ? (
        <Typography>User has no reserved books.</Typography>
      ) : (
        localUserData.queued_books.map((book) => (
          <List key={book.bookID} sx={{ padding: 1 }}>
            <ListItem>
              <Stack direction="row" spacing={2}>
                <Typography>{book.title}</Typography>
                <Button onClick={() => handleIssueBook(book.bookID)}>
                  Issue the book
                </Button>
              </Stack>
            </ListItem>
          </List>
        ))
      )}
    </Box>
  );
};

export default UserDetails;