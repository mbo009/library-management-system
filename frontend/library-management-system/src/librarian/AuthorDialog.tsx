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
}

interface AuthorDialogProps {
  open: boolean;
  onClose: (selectedAuthor?: Author) => void;
}

const AuthorDialog: React.FC<AuthorDialogProps> = ({ open, onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [allAuthors, setAllAuthors] = useState<Array<Author>>([]);

  useEffect(() => {
    
    const fetchedAuthors: Array<Author> = [
        { id: 1, name: "Author #1" },
        { id: 2, name: "Author #2" },
        { id: 3, name: "Author #3" },
        { id: 4, name: "Author #4" },
        { id: 5, name: "Author #5" },
        { id: 6, name: "Author #6" },
        { id: 7, name: "Author #7" },
        { id: 8, name: "Author #8" },
        { id: 9, name: "Author #9" },
        { id: 10, name: "Author #10" },
    ]

    setAllAuthors(fetchedAuthors);
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