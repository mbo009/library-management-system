import React, { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Typography,
  Container,
  List,
  ListItem,
} from "@mui/material";
import transition from "./utils/transition";

// Mock data
const mockProductData = [
  { name: "Product 1" },
  { name: "Product 2" },
  { name: "Special Product 3" },
  { name: "Amazing Product 4" },
];

const Home = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<Array<{ name: string }>>([]);
  const [response, setResponse] = useState<Array<{ name: string }>>([]);

  const handleSearch = async (input: string) => {
    try {
      console.log("Searching products matching query: ", input);

      await new Promise((resolve) => setTimeout(resolve, 500));

      const products = mockProductData.filter((product) =>
        product.name.toLowerCase().includes(input.toLowerCase())
      );

      console.log("Fetched product list:", products);
      setResponse(products);
      setResults(products);
    } catch (error) {
      console.error("Error searching:", error);
    }
  };

  const filterResultsByQuery = (input: string) => {
    setResults(
      response.filter((item) =>
        item.name.toLowerCase().includes(input.toLowerCase())
      )
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setQuery(inputValue);

    if (inputValue.length === 3) {
      handleSearch(inputValue);
    } else if (inputValue.length < 3) {
      setResults([]);
    }
  };

  useEffect(() => {
    if (response.length > 0 && query.length >= 3) {
      filterResultsByQuery(query);
    }
  }, [response, query]);

  return (
    <Container sx={{ padding: 5 }}>
      <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
        <TextField
          label="Search"
          value={query}
          onChange={handleInputChange}
          variant="outlined"
        />
        <Box>
          <Typography>Results:</Typography>
          <List>
            {results.length > 0 ? (
              results.map((result, index) => (
                <ListItem key={index}>{result.name}</ListItem>
              ))
            ) : (
              <ListItem>No results found.</ListItem>
            )}
          </List>
        </Box>
      </Box>
    </Container>
  );
};

export default transition(Home);
