import React, { useEffect, useState } from 'react';
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
} from '@mui/material';

interface Author {
  id: number;
  name: string;
  bio: string;
}

interface AuthorDialogProps {
  open: boolean;
  onClose: (selectedAuthor?: Author) => void;
}

const AuthorDialog: React.FC<AuthorDialogProps> = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [allAuthors, setAllAuthors] = useState<Array<Author>>([]);

  useEffect(() => {

    const fetchAuthors = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/authors`);

        if (response.ok) {
          setAllAuthors(await response.json());
        }
        else {
          alert("Failed to fetch book details");
        }
      } 
      catch (error) {
        alert("Failed to fetch book details " + error);
      }
    }
    
    fetchAuthors();

  }, []);

  const filteredAuthors = allAuthors.filter((author) =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (author: Author) => {
    onClose(author);
  };

  return (
    <Dialog open={open} onClose={() => onClose()} sx={{maxHeight: "80vh"}} maxWidth="sm" fullWidth>
      <DialogTitle>Select an Author</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="normal"
          placeholder="Search author..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <List>
          {filteredAuthors.map((author, index) => (
            <ListItem 
                key={author.id}
                sx={{
                    height: "50px",
                }}
            >
              <ListItemButton sx={{ backgroundColor: index % 2 === 0 ? "grey.100" : "white" }} onClick={() => handleSelect(author)}>
                <ListItemText primary={author.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthorDialog;