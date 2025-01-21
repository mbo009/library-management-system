import UserDetails from "./UserDetails";
import { Book } from "./types/Book";
import { UserProfile } from "./types/UserProfile";
import React from "react";
import { Box, Typography, Button } from "@mui/material";

type AdminPanelProps = {
  selectedItem: Book | UserProfile | null;
};

const AdminPanel: React.FC<AdminPanelProps> = ({ selectedItem }) => {
  const isUserProfileType = (
    item: Book | UserProfile | null
  ): item is UserProfile => {
    return item !== null && "user_id" in item; // Ensure this matches a unique property of UserProfile
  };

  if (!selectedItem) {
    return (
      <Box p={3} alignContent={"center"} textAlign={"center"}>
        <Typography variant="h6">Librarian Panel</Typography>
        <Button>ADD NEW BOOK</Button>
        <Button>ADD NEW AUTHOR</Button>
      </Box>
    );
  }

  if (isUserProfileType(selectedItem)) {
    return <UserDetails userData={selectedItem} />;
  }

  return null;
};

export default AdminPanel;
