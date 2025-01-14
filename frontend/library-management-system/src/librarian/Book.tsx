import React, { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Button,
  Typography,
  Stack,
  Container,
  Divider,
  Chip,
  List,
  ListItem,
  ListSubheader,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import transition from "../utils/transition";

import AuthorDialog from "./AuthorDialog";

interface Author {
  id: number;
  name: string;
}


interface Book {
    id: number;
    isbn: string;
    title: string;
    description: string;
    genre: string;
    authors: Array<Author>;
    publishedDate: Date | null;
    pageCount: number;
}

function initBook(): Book {
    return {
        id: 0,
        isbn: "",
        title: "",
        description: "",
        genre: "",
        authors: [],
        publishedDate: null,
        pageCount: 1,
    };
}

type EditBookProps = {
  create: boolean;
};

const EditBook: React.FC<EditBookProps> = ({ create }) => {
  const [book, setBook] = useState<Book>(initBook());

  const [selectAuthor, setSelectAuthor] = useState(false);

  useEffect(() => {
    
  }, []);

  const handlePublishedDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setBook({...book, publishedDate: new Date()});
  };

  const handleCloseAuthorDialog = (author?: Author) => {
    if (author) {
      setBook({...book, authors: [...book.authors, author] });
    }
    setSelectAuthor(false);
  };
  
  const handleRemoveAuthor = (indexToRemove: number) => {
    const authors = book.authors.filter((_, index) => index !== indexToRemove);
    setBook({...book, authors: authors});
  }


  const isBookISBNValid = isValidISBN(book.isbn);


  return (
    <Container maxWidth="sm" sx={{ paddingY: 5 }}>
      <Box position="relative" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>

        <Typography variant="h2" sx={{ mb: "15px" }}>
          { create ? "Create a new book" : "Edit book"}
        </Typography>

        <TextField
          label="Title"
          fullWidth
          multiline
          rows={1}
          value={book.title}
          onChange={(e) => setBook({...book, title: e.target.value})}
          variant="outlined"
          error={book.title.length == 0}
        />
        <Stack direction="row"  sx={{ width: '100%' }} spacing={2}>
          <TextField
            fullWidth
            label="ISBN"
            multiline
            rows={1}
            value={book.isbn}
            onChange={(e) => setBook({...book, isbn: e.target.value})}
            error={!isBookISBNValid}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Published"
            type="date"
            margin="normal"
            color="secondary"
            value={book.publishedDate?.toISOString().slice(0, 10)}
            onChange={handlePublishedDateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
        
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={6}
          value={book.description}
          onChange={(e) => setBook({...book, description: e.target.value})}
          variant="outlined"
        />

        <Stack direction="row"  sx={{ width: '100%' }} spacing={2}>
          <TextField
            fullWidth
            label="Genre"
            multiline
            rows={1}
            value={book.genre}
            onChange={(e) => setBook({...book, genre: e.target.value})}
            variant="outlined"
          />
          <TextField
            label="Number of pages"
            type="number"
            value={book.pageCount}
            onChange={(e) => setBook({...book, pageCount: Math.max(Number(e.target.value), 1) })}
          />
        </Stack>

        <List
          sx={{
            width: "100%",
            alignItems: "center",
            border: 1,
            borderColor: "grey.300",
            overflow: "auto",
            height: "25vh",
            padding: 0,
            marginBottom: "40px",
          }}
        >
          <ListSubheader sx={{ height: "38px", paddingY: "3px" }}>
            <Box
              sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
            >
                <Typography>Authors</Typography>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => setSelectAuthor(true)}
                >
                  Add
                </Button>
            </Box>
          </ListSubheader>
          <Divider />
          {book.authors.map((author, index) => (
          <ListItem
            key={index}
            sx={{
              backgroundColor: index % 2 === 0 ? "grey.100" : "white",
              '&:hover': {
                backgroundColor: "grey.200",
              },
              height: "40px",
            }}
            secondaryAction={
              <Chip
                label="-"
                onClick={() => handleRemoveAuthor(index)}
              >
              </Chip>
            }
          >
            <ListItemText primary={author.name}/>
          </ListItem>
          ))}
        </List>

        <Button sx={{ mt: "10px" }}
          variant="contained"
          disabled={!isBookISBNValid || (book.title.length == 0)}
        >
          { create ? "Create" : "Save"}
        </Button>
        
        <AuthorDialog open={selectAuthor} onClose={handleCloseAuthorDialog} />

      </Box>
    </Container>
  );
};

function isValidISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, ''); // Remove hyphens and spaces

  if (cleaned.length === 10) {
    return isValidISBN10(cleaned);
  } else if (cleaned.length === 13) {
    return isValidISBN13(cleaned);
  }
  return false;
}

function isValidISBN10(isbn: string): boolean {
  if (!/^\d{9}[\dX]$/.test(isbn)) {
    return false;
  }
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(isbn[i]) * (10 - i);
  }
  sum += isbn[9] === 'X' ? 10 : parseInt(isbn[9]);
  return sum % 11 === 0;
}

function isValidISBN13(isbn: string): boolean {
  if (!/^\d{13}$/.test(isbn)) {
    return false;
  }
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(isbn[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  return sum % 10 === 0;
}

export default transition(EditBook);
