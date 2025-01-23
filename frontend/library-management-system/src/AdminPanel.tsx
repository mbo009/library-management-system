import UserDetails from "./UserDetails";
import BookDetails from "./Book.tsx";
import { Book } from "./types/Book";
import { UserProfile } from "./types/UserProfile";
import React from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

type AdminPanelProps = {
  selectedItem: Book | UserProfile | null;
  setSelectedItem: any;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ selectedItem, setSelectedItem }) => {
  const isUserProfileType = (
    item: Book | UserProfile | null
  ): item is UserProfile => {
    return item !== null && "user_id" in item; // Ensure this matches a unique property of UserProfile
  };
  const isBookType = (
    item: Book | UserProfile | null
  ): item is Book => {
    return item !== null && "bookID" in item; // Ensure this matches a unique property of UserProfile
  };

  if (!selectedItem) {
    return (
      <Box p={3} alignContent={"center"} textAlign={"center"}>
        <Typography variant="h6">Librarian Panel</Typography>
        <Button onClick={() => window.open(`${window.location.origin}/librarian/new_book`)}>ADD NEW BOOK</Button>
        <Button onClick={() => window.open(`${window.location.origin}/librarian/new_author`)}>ADD NEW AUTHOR</Button>
        <Button onClick={() => window.open(`${window.location.origin}/librarian/languages`)}>ADD NEW LANGUAGE</Button>
        <Button onClick={() => window.open(`${window.location.origin}/librarian/genres`)}>ADD NEW GENRE</Button>
      </Box>
    );
  }

  /*
  if (isUserProfileType(selectedItem)) {
    return <UserDetails userData={selectedItem} />;
  }*/

  return (
    <>
      <IconButton
          aria-label="close"
          onClick={() => setSelectedItem(null)}
          sx={(theme) => ({
            position: 'absolute',
            right: 32,
            top: 32,
            color: theme.palette.grey[500],
            zIndex: 100,
          })}
        >
          <CloseIcon />
      </IconButton>
        
      {(isUserProfileType(selectedItem)) && (
        <Box sx={{mt: "25px" }}>
          <UserDetails userData={selectedItem} />
        </Box>
      )}

      {(isBookType(selectedItem)) && (
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <BookDetails book={selectedItem} isAdmin={true}/>
        </Box>
      )}
    </>
  );

  return null;
};

export default AdminPanel;
