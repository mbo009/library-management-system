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
import React from "react";

type UserDetailsProps = {
  userData: UserProfile;
};

const UserDetails: React.FC<UserDetailsProps> = ({ userData }) => {
  console.log(userData.borrowed_books)
  return (
    <Box sx={{ padding: 2 }}>
      <Divider>User Details</Divider>
      <Box
        paddingTop={1}
        paddingBottom={1}
        alignItems={"center"}
        display={"flex"}
        flexDirection={"column"}
      >
        <Typography variant="h5">
          {userData.first_name} {userData.last_name}
        </Typography>
      </Box>
      <Typography>{userData.email}</Typography>
      <Typography>{userData.phone_number}</Typography>
      <Divider>Borrowed Books</Divider>
      {userData.borrowed_books.length === 0 ? (
        <Typography>User has no borrowed books.</Typography>
      ) : (
        userData.borrowed_books.map((book) => (
          <List key={book.bookID} sx={{ padding: 1 }}>
            <ListItem>
              <Stack direction="row" spacing={2}>
                <Typography>{book.title}</Typography>
                <Button>Return book</Button>
              </Stack>
            </ListItem>
          </List>
        ))
      )}
    </Box>
  );
};

export default UserDetails;
