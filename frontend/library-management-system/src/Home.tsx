import { useState, useEffect } from "react";
import {
  TextField,
  Box,
  Typography,
  Paper,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
} from "@mui/material";
import { PersonOutlined, AutoStoriesOutlined } from "@mui/icons-material";
import transition from "./utils/transition";
import { Books } from "./types/BookList";
import { Book } from "./types/Book";
import BookList from "./BookList";
import { UserSummary } from "./types/UserSummary";
import { UserProfile } from "./types/UserProfile";

const Home = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Array<Book | UserProfile>>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [booksLoading, setBooksLoading] = useState<boolean>(false);
  const [books, setBooks] = useState<Books>({
    borrowed: [],
    returned: [],
    queued: [],
  });

  const [user, _setUser] = useState<UserSummary | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [toggleButtonValue, setToggleButtonValue] = useState<string>("book");

  useEffect(() => {
    loadUserBooks();
  }, []);

  useEffect(() => {
    if (query.length >= 4) {
      handleSearch(query);
    }
  }, [toggleButtonValue, query]);

  const loadUserBooks = async () => {
    try {
      setBooksLoading(true);
      console.log("Fetching user books...");

      const response = await fetch(
        "http://localhost:8000/api/get_user_books/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const books = await response.json();
      setBooks(books);
      console.log("Fetched user books:", books);
    } catch (error) {
      console.error("Error fetching user books:", error);
    } finally {
      setBooksLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (toggleButtonValue === "book") {
      searchBooks(query);
    } else if (toggleButtonValue === "user") {
      searchUsers(query);
    }
  };

  const searchBooks = async (query: string) => {
    try {
      setSearchLoading(true);
      console.log("Searching books matching query: ", query);

      const response = await fetch(
        `http://localhost:8000/api/find_book/?query=${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const books = await response.json();

      console.log("Fetched books list:", books);
      setResults(books);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      setSearchLoading(true);
      console.log("Searching users matching query: ", query);

      const response = await fetch(
        `http://localhost:8000/api/find_user/?query=${query}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const users = await response.json();

      console.log("Fetched users list:", users);
      setResults(users);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    if (inputValue.length < 4) {
      setResults([]);
    }
  };

  const handleToggleButtonChange = (
    _event: React.MouseEvent<HTMLElement>,
    newAlignment: string
  ) => {
    if (newAlignment === null) {
      return;
    }
    setToggleButtonValue(newAlignment);
    setResults([]);
  };

  return (
    <Box p={5} maxWidth={"30%"}>
      <Paper elevation={20} sx={{ padding: 2, marginBottom: 2 }}>
        <Stack spacing={2} direction="row">
          <TextField
            label="Search"
            value={query}
            onChange={handleInputChange}
            sx={{ width: "100%" }}
          />
          {user?.is_librarian && (
            <ToggleButtonGroup
              value={toggleButtonValue}
              exclusive
              onChange={handleToggleButtonChange}
            >
              <ToggleButton value="user">
                <PersonOutlined />
              </ToggleButton>
              <ToggleButton value="book">
                <AutoStoriesOutlined />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>
        <Box sx={{ maxHeight: "75vh", overflowY: "auto" }}>
          {searchLoading ? (
            <Box
              marginTop={2}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              overflow={"hidden"}
            >
              <CircularProgress />
            </Box>
          ) : results.length === 0 && query.length >= 4 ? (
            <Typography variant="h6" sx={{ textAlign: "center", marginTop: 2 }}>
              We didn't find a {toggleButtonValue} matching your description.
            </Typography>
          ) : (
            results.map((item) => (
              <Box
                key={"id" in item ? item.id : Math.random()}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  my: 1,
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "lightgray",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Typography variant="h3" sx={{ flexGrow: 1 }}>
                  {"title" in item
                    ? item.title
                    : "first_name" in item && "last_name" in item
                    ? `${item.first_name} ${item.last_name}`
                    : "Unknown"}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Paper>
      <BookList books={books} booksLoading={booksLoading} />
    </Box>
  );
};

export default transition(Home);
