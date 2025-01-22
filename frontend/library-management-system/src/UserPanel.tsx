import { Box, IconButton } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import { Book } from "./types/Book";
import { UserProfile } from "./types/UserProfile";

import BookDetails from "./Book.tsx";


type UserPanelProps = {
  selectedItem: Book | UserProfile | null;
  setSelectedItem: any;
};



const UserPanel: React.FC<UserPanelProps> = ({ selectedItem, setSelectedItem }) => {
  const isUserProfileType = (
    item: Book | UserProfile | null
  ): item is UserProfile => {
    return item !== null && "user_id" in item; // Ensure this matches a unique property of UserProfile
  };

  if (selectedItem == null || isUserProfileType(selectedItem)) {
    return <Box />;
  }

  return (
    <Box
      position="relative"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <IconButton
          aria-label="close"
          onClick={() => setSelectedItem(null)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
            zIndex: 100,
          })}
        >
          <CloseIcon />
      </IconButton>

      <BookDetails book={selectedItem} isAdmin={false}/>
    </Box>
  );
};
export default UserPanel;
