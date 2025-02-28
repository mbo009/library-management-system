import React, { useEffect, useState } from "react";
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
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Backdrop,
  Paper,
  InputAdornment,
} from "@mui/material";
import transition from "../utils/transition";
import CoverFrame from "./CoverFrame";
import AuthorDialog from "./AuthorDialog";
import { Add } from "@mui/icons-material";
import EditLanguages from "./Languages";
import EditGenres from "./Genres";

interface Author {
  id: number;
  name: string;
  bio: string;
}

interface Book {
  bookID: number | null;
  authors: Array<Author>;
  cover_url: string;
  title: string;
  description: string;
  isbn: string;
  published_date: string | null;
  page_count: number;
  genre: number;
  language: number;
  total_copies: number;
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
    cover_url: "",
    published_date: null,
    page_count: 1,
    total_copies: 1,
    language: 0,
  };
}

type EditBookProps = {
  create: boolean;
  bookID?: number;
};

const EditBook: React.FC<EditBookProps> = ({ create, bookID }) => {
  const [book, setBook] = useState<Book>(initBook());
  const [open, setOpen] = useState<boolean>(false);
  const [languages, setLanguages] = useState<Array<Language>>([]);
  const [genres, setGenres] = useState<Array<Genre>>([]);
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );

  const [selectAuthor, setSelectAuthor] = useState(false);

  const [openGenreBackdrop, setOpenGenreBackdrop] = useState(false);
  const handleOpenGenreBackdrop = () => setOpenGenreBackdrop(true);
  const handleCloseGenreBackdrop = () => setOpenGenreBackdrop(false);
  const [openLanguageBackdrop, setOpenLanguageBackdrop] = useState(false);
  const handleOpenLanguageBackdrop = () => setOpenLanguageBackdrop(true);
  const handleCloseLanguageBackdrop = () => setOpenLanguageBackdrop(false);
  const [alertMessage, setAlertMessage] = useState<string>("");

  const handleMediaChanged = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const attachedFile = event.target.files?.[0];
    if (attachedFile) {
      setSelectedCoverPhoto(attachedFile);
    }
  };

  useEffect(() => {
    if (alertMessage && !loading) {
      setOpen(true);
    }
  }, [alertMessage]);

  useEffect(() => {
    setLoading(true);
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
    setLoading(false);
  }, []);

  if (!create && book.bookID === null)
    return (
      <Box
        sx={{ width: "100%", height: "100%" }}
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <CircularProgress color="secondary" />
      </Box>
    );

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
    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("title", book.title);
      formData.append("description", book.description);
      formData.append("isbn", book.isbn.replace(/[-\s]/g, ""));
      formData.append("published_date", book.published_date || "");
      formData.append("page_count", book.page_count.toString());
      formData.append("genre", book.genre.toString());
      formData.append("language", book.language.toString());
      formData.append("total_copies", book.total_copies.toString());
      console.log(formData);
      formData.append(
        "authors",
        JSON.stringify(book.authors.map((author) => author.id))
      );

      if (selectedCoverPhoto) {
        formData.append("cover", selectedCoverPhoto);
      } else if (book.cover_url) {
        formData.append("cover", book.cover_url);
      }

      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

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
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Error response from server:", error);
        throw new Error("Failed to save book details.");
      }

      setAlertSeverity("success");
      setAlertMessage("Book saved successfully.");
      setOpen(true);
    } catch (error) {
      console.error("Error saving book:", error);
      setAlertSeverity("error");
      setAlertMessage("Failed to save book details.");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpen(false);
  };

  const isBookISBNValid = isValidISBN(book.isbn);

  return (
    <Container sx={{ paddingY: 5 }}>
      <Stack direction="column" spacing={2} alignItems="center">
        <Stack
          direction="row"
          spacing={2}
          justifyContent={"center"}
          alignContent={"center"}
          width={"74%"}
        >
          <TextField
            label="Title"
            multiline
            rows={1}
            value={book.title}
            onChange={(e) => setBook({ ...book, title: e.target.value })}
            variant="outlined"
            error={book.title.length == 0}
            sx={{ width: "80%" }}
          />
          <Button
            variant="contained"
            disabled={!isBookISBNValid || book.title.length == 0 || loading}
            onClick={handleSaveBook}
            sx={{ width: "20%" }}
          >
            {loading ? (
              <CircularProgress color="secondary" size={24} />
            ) : create ? (
              "Create"
            ) : (
              "Save"
            )}
          </Button>
        </Stack>
        <Stack direction="row" spacing={2}>
          <Box
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <Stack direction="row" sx={{ width: "420px" }} spacing={2}>
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
              onChange={(e) =>
                setBook({ ...book, description: e.target.value })
              }
              variant="outlined"
            />

            <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="genre-select-label">Genre</InputLabel>
                <Select
                  labelId="genre-select-label"
                  value={book.genre}
                  IconComponent={() => <></>}
                  label="Genre"
                  onChange={(e) =>
                    setBook({ ...book, genre: Number(e.target.value) })
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={handleOpenGenreBackdrop}
                      >
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5,
                        overflowY: "auto",
                      },
                    },
                  }}
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
            <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="language-select-label">Language</InputLabel>
                <Select
                  labelId="language-select-label"
                  value={book.language}
                  label="Language"
                  IconComponent={() => <></>}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={handleOpenLanguageBackdrop}
                      >
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  }
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
              <TextField
                label="Total copies"
                type="number"
                value={book.total_copies}
                onChange={(e) =>
                  setBook({
                    ...book,
                    total_copies: Math.max(Number(e.target.value), 1),
                  })
                }
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
                    onClick={() => {
                      setSelectAuthor(true);
                    }}
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

            <AuthorDialog
              open={selectAuthor}
              onClose={handleCloseAuthorDialog}
              setAlertMessage={setAlertMessage}
            />
          </Box>
          <Stack direction="column" spacing={2}>
            <CoverFrame
              selectedCoverPhoto={selectedCoverPhoto}
              book={book}
              handleMediaChanged={handleMediaChanged}
            />
          </Stack>
        </Stack>
      </Stack>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>

      <Backdrop
        open={openGenreBackdrop}
        onClick={handleCloseGenreBackdrop}
        sx={{ color: "#fff", zIndex: 20 }}
      >
        <Paper elevation={20} sx={{ padding: 2, width: "30%", height: "60%" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%", width: "100%" }}
          >
            <EditGenres
              genres={genres}
              setGenres={setGenres}
              setAlertMessage={setAlertMessage}
            />
          </Box>
        </Paper>
      </Backdrop>

      <Backdrop
        open={openLanguageBackdrop}
        onClick={handleCloseLanguageBackdrop}
        sx={{ color: "#fff", zIndex: 20 }}
      >
        <Paper elevation={20} sx={{ padding: 2, width: "30%", height: "60%" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ height: "100%", width: "100%" }}
          >
            <EditLanguages
              languages={languages}
              setLanguages={setLanguages}
              setAlertMessage={setAlertMessage}
            />
          </Box>
        </Paper>
      </Backdrop>
    </Container>
  );
};

function isValidISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, "");

  if (cleaned.length === 10 || cleaned.length === 13) {
    return true;
  }
  return false;
}

export default transition(EditBook);
