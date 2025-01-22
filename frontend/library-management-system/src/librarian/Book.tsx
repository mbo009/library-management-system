import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from "@mui/material";
import transition from "../utils/transition";

import AuthorDialog from "./AuthorDialog";

interface Author {
  id: number;
  name: string;
  bio: string;
}

interface Book {
  bookID: number | null;
  authors: Array<Author>;
  coverPhoto: string;
  title: string;
  description: string;
  isbn: string;
  published_date: string | null;
  page_count: number;
  genre: number;
  language: number;
}

interface Language {
  languageID: number;
  name: string;
  shortcut: string;
}

interface Genre {
  genreID: number;
  name: string;
}

function initBook(): Book {
  return {
    bookID: null,
    isbn: "",
    title: "",
    description: "",
    genre: 0,
    authors: [],
    coverPhoto: "",
    published_date: null,
    page_count: 1,
    language: 0,
  };
}

type EditBookProps = {
  create: boolean;
};

const EditBook: React.FC<EditBookProps> = ({ create }) => {
  const [book, setBook] = useState<Book>(initBook());
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [genres, setGenres] = useState<Array<Genre>>([]);
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File | null>(
    null
  );

  const [searchParams, _] = useSearchParams();
  const bookID = searchParams.get("book_id");

  const [selectAuthor, setSelectAuthor] = useState(false);

  const handleMediaChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const attachedFile = event.target.files?.[0];
    if (attachedFile) {
      setSelectedCoverPhoto(attachedFile);
    }
  };

  const uploadMedia = async (attachedFile: File): Promise<string | null> => {
    if (!attachedFile) return null;

    const formData = new FormData();
    formData.append("cover", attachedFile);
    formData.append("data", JSON.stringify({ bookID: bookID }));

    try {
      const response = await fetch("http://localhost:8000/api/upload_cover/", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!response.ok) {
        alert("Failed to upload media: " + response.statusText);
        return null;
      }

      const data = await response.json();
      console.log(data);
      if (!book.coverPhoto.includes(data.mediaPath)) {
        setBook({
          ...book,
          coverPhoto: data.mediaPath,
        });
      }
      return data.mediaPath;
    } catch (error) {
      alert("Failed to upload media: " + error);
      return null;
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/api/book/${bookID}`
        );

        if (response.ok) {
          const book = await response.json();

          if (book.genre === null) {
            book.genre = 0;
          }
          if (book.language === null) {
            book.language = 0;
          }

          setBook(book);
        } else {
          alert("Failed to fetch book details");
        }
      } catch (error) {
        alert("Failed to fetch book details " + error);
      }
    };

    const fetchLanguages = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/languages/`);

        if (response.ok) {
          setLanguages(await response.json());
        } else {
          alert("Failed to fetch languages");
        }
      } catch (error) {
        alert("Failed to fetch languages " + error);
      }
    };

    const fetchGenres = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/genres/`);

        if (response.ok) {
          setGenres(await response.json());
        } else {
          alert("Failed to fetch genres");
        }
      } catch (error) {
        alert("Failed to fetch genres " + error);
      }
    };

    if (!create) fetchBook();

    fetchLanguages();
    fetchGenres();
  }, []);

  if (!create && book.bookID === null) return <>Loading...</>;

  console.log(book);

  const handlePublishedDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const date = e.target.value;
    setBook({ ...book, published_date: date });
  };

  const handleCloseAuthorDialog = (author?: Author) => {
    if (author) {
      const matchingAuthor = book.authors.find((a) => a.id == author.id);
      if (matchingAuthor === undefined) {
        setBook({ ...book, authors: [...book.authors, author] });
      }
    }
    setSelectAuthor(false);
  };

  const handleRemoveAuthor = (indexToRemove: number) => {
    const authors = book.authors.filter((_, index) => index !== indexToRemove);
    setBook({ ...book, authors: authors });
  };

  const handleSaveBook = async () => {
    try {
      let coverMediaPath = book.coverPhoto;
      if (selectedCoverPhoto) {
        const uploadedPath = await uploadMedia(selectedCoverPhoto);
        if (uploadedPath) {
          coverMediaPath = uploadedPath;
        }
      }

      const requestBody = {
        authors: book.authors.map((author) => author.id),
        title: book.title,
        description: book.description,
        isbn: book.isbn,
        published_date: book.published_date,
        page_count: book.page_count,
        genre: book.genre,
        language: book.language,
        cover: coverMediaPath,
      };

      let api, method;
      if (create) {
        api = "http://localhost:8000/api/create_book/";
        method = "POST";
      } else {
        api = `http://localhost:8000/api/update_book/${book.bookID}/`;
        method = "PUT";
      }

      const response = await fetch(api, {
        method: method,
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save book details.");
      }

      console.log("Book saved successfully.");
    } catch (error) {
      console.error("Error saving book:", error);
    }
  };

  const isBookISBNValid = isValidISBN(book.isbn);

  return (
    <Container maxWidth="sm" sx={{ paddingY: 5 }}>
      <Box
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap={2}
      >
        <Typography variant="h2" sx={{ mb: "15px" }}>
          {create ? "Create a new book" : "Edit book"}
        </Typography>

        <TextField
          label="Title"
          fullWidth
          multiline
          rows={1}
          value={book.title}
          onChange={(e) => setBook({ ...book, title: e.target.value })}
          variant="outlined"
          error={book.title.length == 0}
        />
        <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
          <TextField
            fullWidth
            label="ISBN"
            multiline
            rows={1}
            value={book.isbn}
            onChange={(e) => setBook({ ...book, isbn: e.target.value })}
            error={!isBookISBNValid}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Published"
            type="date"
            margin="normal"
            color="secondary"
            value={book.published_date !== null ? book.published_date : ""}
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
          onChange={(e) => setBook({ ...book, description: e.target.value })}
          variant="outlined"
        />

        <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="genre-select-label">Genre</InputLabel>
            <Select
              labelId="genre-select-label"
              value={book.genre}
              label="Genre"
              onChange={(e) =>
                setBook({ ...book, genre: Number(e.target.value) })
              }
            >
              <MenuItem key={0} value={0}>
                ---
              </MenuItem>
              {genres.map((genre, index) => (
                <MenuItem key={index + 1} value={genre.genreID}>
                  {genre.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Number of pages"
            type="number"
            value={book.page_count}
            onChange={(e) =>
              setBook({
                ...book,
                page_count: Math.max(Number(e.target.value), 1),
              })
            }
          />
        </Stack>

        <FormControl fullWidth>
          <InputLabel id="language-select-label">Language</InputLabel>
          <Select
            labelId="language-select-label"
            value={book.language}
            label="Language"
            onChange={(e) =>
              setBook({ ...book, language: Number(e.target.value) })
            }
          >
            <MenuItem key={0} value={0}>
              ---
            </MenuItem>
            {languages.map((language, index) => (
              <MenuItem key={index + 1} value={language.languageID}>
                {language.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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
                "&:hover": {
                  backgroundColor: "grey.200",
                },
                height: "40px",
              }}
              secondaryAction={
                <Chip
                  label="-"
                  onClick={() => handleRemoveAuthor(index)}
                ></Chip>
              }
            >
              <ListItemText primary={author.name} />
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          component="label"
          sx={{ marginBottom: "16px" }}
        >
          ADD COVER PHOTO
          <input type="file" hidden onChange={handleMediaChanged} />
        </Button>

        <Button
          sx={{ mt: "10px" }}
          variant="contained"
          disabled={!isBookISBNValid || book.title.length == 0}
          onClick={handleSaveBook}
        >
          {create ? "Create" : "Save"}
        </Button>

        <AuthorDialog open={selectAuthor} onClose={handleCloseAuthorDialog} />
      </Box>
    </Container>
  );
};

function isValidISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, "");

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
  sum += isbn[9] === "X" ? 10 : parseInt(isbn[9]);
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
