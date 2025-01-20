import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TextField,
  Box,
  Button,
  Typography,
  Container,
} from "@mui/material";
import transition from "../utils/transition";

interface Author {
  id: number | null;
  name: string;
  bio: string;
}

function initAuthor(): Author {
  return {
      id: null,
      name: "",
      bio: "",
  };
}

type EditAuthorProps = {
  create: boolean;
};

const EditAuthor: React.FC<EditAuthorProps> = ({ create }) => {
  const [author, setAuthor] = useState<Author>(initAuthor());

  const [searchParams, _] = useSearchParams();
  const authorID = searchParams.get("author_id");

  useEffect(() => {

    const fetchAuthor = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/author/${authorID}`);
        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }
        setAuthor(await response.json());
      } 
      catch (error) {
        alert("Failed to fetch author details: " + error);
      }
    }

    if (!create)
      fetchAuthor();

  }, []);

  if (!create && author.id === null)
      return <>Loading...</>;

  if (author.bio === null)
    setAuthor({...author, bio: "" });


  const handleSaveAuthor = async () => {

    let api, method;
    if (create) {
      api = "http://localhost:8000/api/create_author/";
      method = "POST";
    }
    else {
      api = `http://localhost:8000/api/update_author/${author.id}/`;
      method = "PUT";
    }

    const response = await fetch(api, {
      method: method, 
      body: JSON.stringify(author),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      alert("Failed to save changes");
    }
  }

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
          {create ? "Create a new author" : "Edit author"}
        </Typography>

        <TextField
          label="Name"
          fullWidth
          multiline
          rows={1}
          value={author.name}
          onChange={(e) => setAuthor({ ...author, name: e.target.value })}
          variant="outlined"
          error={author.name.length == 0}
        />
        <TextField
          label="Biography"
          fullWidth
          multiline
          rows={12}
          value={author.bio}
          onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
          variant="outlined"
        />

        <Button
          sx={{ mt: "10px" }}
          variant="contained"
          disabled={author.name.length == 0}
          onClick={handleSaveAuthor}
        >
          {create ? "Create" : "Save"}
        </Button>

      </Box>
    </Container>
  );
};

export default transition(EditAuthor);
