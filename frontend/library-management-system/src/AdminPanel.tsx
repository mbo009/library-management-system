import UserDetails from "./UserDetails";
import BookDetails from "./Book.tsx";
import { Book } from "./types/Book";
import { UserProfile } from "./types/UserProfile";
import React, { useEffect, useState } from "react";
import { Box, Typography, Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditBook from "./librarian/Book";
import transition from "./utils/transition.tsx";
import LibrarianKeyList from "./librarian/LibrarianKeyList";
type AdminPanelProps = {
  selectedItem: Book | UserProfile | null;
  setSelectedItem: any;
  librarian_id: number;
};

const AdminPanel: React.FC<AdminPanelProps> = ({
  selectedItem,
  setSelectedItem,
  librarian_id,
}) => {
  const isUserProfileType = (
    item: Book | UserProfile | null
  ): item is UserProfile => {
    return item !== null && "user_id" in item;
  };
  const isBookType = (item: Book | UserProfile | null): item is Book => {
    return item !== null && "bookID" in item;
  };
  const [isEditingBook, setIsEditingBook] = useState(false);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [editedBook, setEditedBook] = useState<number | undefined>(undefined);

  useEffect(() => {
    setSelectedItem(null);
  }, [isEditingBook]);

  if (!selectedItem && !isEditingBook && !isCreatingBook) {
    return (
      <Box
        p={10}
        position={"relative"}
        alignContent={"center"}
        textAlign={"center"}
        alignItems={"center"}
        alignSelf={"center"}
      >
        <Typography variant="h2">Librarian Panel</Typography>
        <Button
          onClick={() => {
            setIsCreatingBook(true);
          }}
        >
          ADD NEW BOOK
        </Button>
        <LibrarianKeyList librarian_id={librarian_id} />
      </Box>
    );
  }

  /*
  if (isUserProfileType(selectedItem)) {
    return <UserDetails userData={selectedItem} />;
  }*/

  return (
    <Box
      p={3}
      position={"relative"}
      alignContent={"center"}
      textAlign={"center"}
      alignItems={"center"}
      alignSelf={"center"}
    >
      <IconButton
        aria-label="close"
        onClick={() => {
          setSelectedItem(null);
          setIsEditingBook(false);
          setIsCreatingBook(false);
        }}
        sx={(theme) => ({
          position: "absolute",
          right: 32,
          top: 32,
          color: theme.palette.grey[500],
          zIndex: 100,
        })}
      >
        <CloseIcon />
      </IconButton>

      {isEditingBook && (
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <EditBook create={false} bookID={editedBook} />
        </Box>
      )}

      {isCreatingBook && (
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <EditBook create={true} />
        </Box>
      )}

      {isUserProfileType(selectedItem) && (
        <Box sx={{ mt: "25px" }}>
          <UserDetails userData={selectedItem} />
        </Box>
      )}

      {isBookType(selectedItem) && (
        <Box
          position="relative"
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <BookDetails
            book={selectedItem}
            editBook={setIsEditingBook}
            isAdmin={true}
            setEditedBook={setEditedBook}
          />
        </Box>
      )}
    </Box>
  );
};

export default transition(AdminPanel);
