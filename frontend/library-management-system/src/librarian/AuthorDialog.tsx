import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { Edit } from "@mui/icons-material";
import EditAuthor from "./Author";

interface Author {
  id: number | undefined;
  name: string;
  bio: string;
}

interface AuthorDialogProps {
  open: boolean;
  onClose: any;
  setAlertMessage?: any;
}

const AuthorDialog: React.FC<AuthorDialogProps> = ({
  open,
  onClose,
  setAlertMessage,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [allAuthors, setAllAuthors] = useState<Array<Author>>([]);
  const [addingAuthor, setAddingAuthor] = useState<boolean>(false);
  const [editingAuthor, setEditingAuthor] = useState<boolean>(false);
  const [selectedAuthor, setSelectedAuthor] = useState<number | undefined>(
    undefined
  );

  useEffect(() => {
    const fetchAuthors = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/authors`);

        if (response.ok) {
          setAllAuthors(await response.json());
        } else {
          alert("Failed to fetch book details");
        }
      } catch (error) {
        alert("Failed to fetch book details " + error);
      }
    };

    fetchAuthors();
  }, []);

  const filteredAuthors = allAuthors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (author: Author) => {
    onClose(author);
  };

  return (
    <Dialog open={open} onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>
        {addingAuthor ? "Create a new Author" : "Select an Author"}
      </DialogTitle>
      <DialogContent sx={{ minHeight: "70vh", maxHeight: "70vh", mb: "20px" }}>
        {!addingAuthor && !editingAuthor ? (
          <>
            <TextField
              fullWidth
              margin="normal"
              placeholder="Search author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {filteredAuthors.length > 0 ? (
              <List>
                {filteredAuthors.map((author, index) => (
                  <ListItem
                    key={author.id}
                    sx={{
                      height: "50px",
                    }}
                  >
                    <ListItemButton
                      sx={{
                        backgroundColor: index % 2 === 0 ? "grey.100" : "white",
                      }}
                      onClick={() => handleSelect(author)}
                    >
                      <ListItemText primary={author.name} />
                    </ListItemButton>
                    <IconButton
                      onClick={() => {
                        setSelectedAuthor(author.id);
                        setEditingAuthor(true);
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography sx={{ mt: "30px", color: "#a0a0a0" }}>
                No authors have been found.
              </Typography>
            )}
          </>
        ) : editingAuthor ? (
          <EditAuthor
            create={false}
            setAuthors={setAllAuthors}
            authors={allAuthors}
            authorID={selectedAuthor}
            setAlertMessage={setAlertMessage}
          />
        ) : (
          <EditAuthor
            create={true}
            setAuthors={setAllAuthors}
            authors={allAuthors}
            setAlertMessage={setAlertMessage}
          />
        )}
      </DialogContent>
      <DialogActions>
        {!addingAuthor && !editingAuthor ? (
          <>
            <Button onClick={() => setAddingAuthor(true)}>
              Create new author
            </Button>
            <Button
              onClick={() => {
                setAddingAuthor(false);
                onClose();
              }}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => {
                setAddingAuthor(false);
                setEditingAuthor(false);
              }}
            >
              Back
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AuthorDialog;
