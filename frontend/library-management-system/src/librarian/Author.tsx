import React, { useEffect, useState, SetStateAction } from "react";
// import { useSearchParams } from "react-router-dom";
import { TextField, Box, Button, CircularProgress } from "@mui/material";
interface Author {
  id: number | undefined;
  name: string;
  bio: string;
}

function initAuthor(): Author {
  return {
    id: undefined,
    name: "",
    bio: "",
  };
}

type EditAuthorProps = {
  create: boolean;
  authorID?: number;
  setAuthors: React.Dispatch<SetStateAction<Author[]>>;
  authors: Array<Author>;
  setAlertMessage: any;
};

const EditAuthor: React.FC<EditAuthorProps> = ({
  create,
  authorID,
  setAuthors,
  authors,
  setAlertMessage,
}) => {
  const [author, setAuthor] = useState<Author>(initAuthor());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchAuthor = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:8000/api/author/${authorID}`
        );
        if (!response.ok) {
          throw new Error(`Status: ${response.status}`);
        }
        setAuthor(await response.json());
      } catch (error) {
        alert("Failed to fetch author details: " + error);
      } finally {
        setLoading(false);
      }
    };

    if (!create) fetchAuthor();
  }, []);

  if (!create && author.id === null) return <>Loading...</>;

  if (author.bio === null) setAuthor({ ...author, bio: "" });

  const handleSaveAuthor = async () => {
    let api, method;
    if (create) {
      api = "http://localhost:8000/api/create_author/";
      method = "POST";
    } else {
      api = `http://localhost:8000/api/update_author/${author.id}/`;
      method = "PUT";
    }

    const requestBody = {
      name: author.name,
      bio: author.bio,
    };

    try {
      setLoading(true);
      const response = await fetch(api, {
        method: method,
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to save changes");
        setAlertMessage("Failed to save changes");
      }

      const updatedAuthor = await response.json();
      setAuthors([...authors, updatedAuthor]);
      setAlertMessage("Author saved successfully");
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxWidth="sm"
      sx={{
        m: "auto",
        paddingTop: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        gap: 2,
        width: "90%",
      }}
    >
      <TextField
        label="Name"
        fullWidth
        multiline
        rows={1}
        value={author.name}
        onChange={(e) => setAuthor({ ...author, name: e.target.value })}
        variant="outlined"
        error={author.name.length == 0}
        disabled={loading}
      />
      <TextField
        label="Biography"
        fullWidth
        multiline
        rows={12}
        value={author.bio}
        onChange={(e) => setAuthor({ ...author, bio: e.target.value })}
        variant="outlined"
        disabled={loading}
      />

      {loading ? (
        <CircularProgress />
      ) : (
        <Button
          sx={{ mt: "10px" }}
          variant="contained"
          disabled={author.name.length == 0}
          onClick={handleSaveAuthor}
        >
          {create ? "Create" : "Save"}
        </Button>
      )}
    </Box>
  );
};

export default EditAuthor;
