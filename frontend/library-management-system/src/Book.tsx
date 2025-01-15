import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  TextField,
  Box,
  Button,
  Paper,
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
import transition from "./utils/transition";


interface Author {
  id: number;
  name: string;
  bio: string;
}


interface Book {
    bookID: number;
    authors: Array<Author>;
    genre_name: string;
    language_name: string;
    language_shortcut: string;
    title: string;
    description: string;
    isbn: string;
    published_date: string;
    page_count: number;
    created_at: string;
    updated_at: string;
    genre: number;
    language: number;
}



const Book = () => {
  const [book, setBook] = useState<Book | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const bookID = searchParams.get("book_id");

  useEffect(() => {

    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/book/${bookID}`);

        if (response.ok) {
          setBook(await response.json());
        }
        else {
          alert("Failed to fetch books");
        }
      } 
      catch (error) {
        alert("Failed to fetch books " + error);
      }
    }

    fetchBook();

    /*
    setBook({
      id: 5,
      authors: [{id:5, name: "Mark Twain", bio: null}],
      title:"The Adventures of Huckleberry Finn",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      isbn:"9780486280615",
      published_date: "2025-14-01",
      page_count:1,
      genre:"Fiction",
    })*/
  }, []);

  if (book == null)
    return <>Loading...</>

  return (
    <Container maxWidth="sm" sx={{ paddingY: 5 }}>
      <Box position="relative" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>

        <Typography variant="h2" sx={{ mb: "15px" }}>
          {book.title}
        </Typography>

        <Typography sx={{ mb: "15px" }}>
          {book.description}
        </Typography>
        
        <Divider textAlign="left" style={{width:'100%'}}>
          Authors
        </Divider>

        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'flex-start',
            flexWrap: 'wrap',
            gap: 1,
            p: 0.5,
            m: 0,
            width: "100%",
          }}
          component="ul"
        >
          {book.authors.map((author, index) => {
            return (
              <li key={index} style={{ listStyleType: "none" }}>
                <Chip
                  sx={{ margin: 0.5 }}
                  label={author.name}
                  onClick={() => console.log("a")}
                />
              </li>
            );
          })}
        </Paper>

        <Divider sx={{ mt: "15px", width:'100%'}}/>

        <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
          <Box flex={1} textAlign="left">
            <Typography>
              <b>Published: </b> {book.published_date}
            </Typography>
            <Typography>
              <b>ISBN: </b> {book.isbn}
            </Typography>
            <Typography>
              <b>Language: </b> {book.language_name + " (" + book.language_shortcut + ")"}
            </Typography>

          </Box>
          <Box flex={1} textAlign="left">
            <Typography sx={{ textTransform: 'capitalize' }}>
              <b>Genre: </b> {book.genre_name}
            </Typography>
            <Typography>
              <b>Pages: </b> {book.page_count}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" justifyContent="space-between" width="100%" gap={2}>
          <Box flex={1} alignItems="center" justifyContent="center" >     
            <Button sx={{ width: "70%", ml: "20px", mt: "100px" }} variant="contained">
              Borrow
            </Button>
          </Box>
          <Box flex={1} alignItems="center" >
            <Button sx={{ width: "70%", ml: "20px", mt: "100px" }} variant="contained">
              Reserve
            </Button>
          </Box>
        </Box>

      </Box>
    </Container>
  );
};

export default transition(Book);
