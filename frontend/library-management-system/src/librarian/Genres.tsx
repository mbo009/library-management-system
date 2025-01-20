import { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Button,
  Typography,
  Stack,
  Container,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  CircularProgress,
} from "@mui/material";
import transition from "../utils/transition";



interface Genre {
  genreID: number | null;
  name: string;
}

const EditGenres = () => {
  const [genres, _setGenres] = useState<Array<Genre>>([]);
  const [selected, setSelected] = useState<Genre>({ genreID: null, name: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const setGenres = (genres: Array<Genre>) => {
    genres.sort((g1, g2) => g1.name.toLowerCase().localeCompare(g2.name.toLowerCase()));
    _setGenres(genres);
  }

  const deselect = () => {
    setSelected({ genreID: null, name: "" });
  }

  useEffect(() => {

    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/genres/`);

        if (response.ok) {
          setGenres(await response.json());
        }
        else {
          alert("Failed to fetch genres");
        }
      } 
      catch (error) {
        alert("Failed to fetch genres " + error);
      }
      finally {
        setLoading(false);
      }
    }

    fetchGenres();

  }, []);

  let original = genres.find(genre => genre.genreID === selected.genreID);

  const handleSaveChanges = async () => {
    const requestBody = {
      name: selected.name,
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/genres/${selected.genreID}/`, {
        method: "PUT", 
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const index = genres.findIndex(genre => genre.genreID === selected.genreID);
      genres[index] = await response.json();
      deselect();
      setGenres([...genres]);
    }
    catch (error) {

    }
    finally {
      setLoading(false);
    }
  }

  const handleAdd = async () => {
    const requestBody = {
      name: selected.name,
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/genres/`, {
        method: "POST", 
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const newGenre = await response.json()
      deselect();
      setGenres([...genres, newGenre ]);
    }
    catch (error) {

    }
    finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    const requestBody = {
      genreID: selected.genreID,
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:8000/api/genres/${selected.genreID}/`, {
        method: "DELETE", 
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const newGenres = genres.filter(genre => genre.genreID !== selected.genreID);
      deselect();
      setGenres([...newGenres]);
    }
    catch (error) {

    }
    finally {
      setLoading(false);
    }

  }

  const isInvalid = selected.name.length === 0;

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
          Genres
        </Typography>

        <List
          sx={{
            width: "100%",
            alignItems: "center",
            border: 1,
            borderColor: "grey.300",
            overflow: "auto",
            height: "40vh",
            padding: 0,
            marginBottom: "40px",
          }}
        >
          {genres.map((genre, index) => (
            
            genre.genreID === selected.genreID ? (
              <ListItem
                key={index}
                sx={{
                  backgroundColor: "#DEDEF4",
                  height: "40px",
                }}
                secondaryAction={
                  <Checkbox checked onChange={() => deselect()} />
                }
              >
                {genre.name}
              </ListItem>
            ) : (
              <ListItemButton 
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? "grey.100" : "white",
                  height: "40px",
                }}
                onClick={() => setSelected({...genre})}
              >
                {genre.name}
              </ListItemButton>
            )
          ))}
        </List>
        
        <TextField
          label="Genre name"
          fullWidth
          value={selected.name}
          onChange={(e) => setSelected({ ...selected, name: e.target.value })}
          variant="outlined"
          disabled={loading}
        />
        
        {loading ? (
          <CircularProgress />
        ) : (
          selected.genreID === null ? (
            <Button
            variant="contained"
            onClick={handleAdd}
            sx={{ m: "10px "}}
            disabled={isInvalid}
            >
              Add
            </Button>
          ) : (
            <Stack 
              direction="row" 
            >
              <Button
                variant="contained"
                onClick={handleSaveChanges}
                sx={{ m: "10px "}}
                disabled={selected.name === original?.name || isInvalid}
              >
                Update
              </Button>
              <Button
                variant="contained"
                onClick={handleDelete}
                sx={{ m: "10px "}}
              >
                Delete
              </Button>
            </Stack>
          )
        )}
      </Box>
    </Container>
  );
};


export default transition(EditGenres);
