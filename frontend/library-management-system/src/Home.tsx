import { useState } from "react";
import {
  TextField,
  Box,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import transition from "./utils/transition";

type Book = {
  id: number;
  title: string;
  authors: string[];
  genre: string;
  isbn: string;
  description: string | null;
  page_count: number | null;
  published_date: string | null;
  created_at: string;
  updated_at: string;
};

const Home = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Array<Book>>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSearch = async (input: string) => {
    try {
      setLoading(true);
      console.log("Searching books matching query: ", input);

      const response = await fetch(
        `http://localhost:8000/api/find_book/?query=${input}`,
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
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    if (inputValue.length >= 4) {
      handleSearch(inputValue);
    } else if (inputValue.length < 4) {
      setResults([]);
    }
  };

  return (
    <Box p={5} maxWidth={"30%"}>
      <Paper elevation={20} sx={{ padding: 2, marginBottom: 2 }}>
        <TextField
          label="Search"
          value={query}
          onChange={handleInputChange}
          sx={{ width: "100%" }}
        />
        <Box sx={{ maxHeight: "75vh", overflowY: "auto" }}>
          {loading ? (
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
              We didn't find a book matching your description.
            </Typography>
          ) : (
            results.map((item) => (
              <Box
                key={item.title}
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
                  {item.title}
                </Typography>
              </Box>
            ))
          )}
        </Box>
      </Paper>
      <Paper elevation={20} sx={{ padding: 2 }}>
        <Typography variant="h3">Your books</Typography>
      </Paper>
    </Box>
  );
};

export default transition(Home);
