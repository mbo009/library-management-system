import { useEffect, useState } from "react";
import {
  TextField,
  Box,
  Button,
  Stack,
  Checkbox,
  List,
  ListItem,
  ListItemButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import transition from "../utils/transition";

interface Genre {
  genreID: number | null;
  name: string;
}

type EditGenresProps = {
  genres: Array<Genre>;
  setGenres: any;
  setAlertMessage: (message: string) => void;
};

const EditGenres: React.FC<EditGenresProps> = ({
  genres,
  setGenres,
  setAlertMessage,
}) => {
  const [selected, setSelected] = useState<Genre>({ genreID: null, name: "" });
  const [loading, setLoading] = useState<boolean>(false);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => setDialogOpen(false);
  const handleConfirmDelete = () => {
    handleDialogClose();
    handleDelete();
  };

  const deselect = () => {
    setSelected({ genreID: null, name: "" });
  };

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8000/api/genres/`);

        if (response.ok) {
          setGenres(await response.json());
        } else {
          alert("Failed to fetch genres");
        }
      } catch (error) {
        alert("Failed to fetch genres " + error);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, [setGenres]);

  const original = genres.find((genre) => genre.genreID === selected.genreID);

  const handleSaveChanges = async () => {
    const requestBody = {
      name: selected.name,
    };

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/genres/${selected.genreID}/`,
        {
          method: "PUT",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const index = genres.findIndex(
        (genre) => genre.genreID === selected.genreID
      );
      genres[index] = await response.json();
      deselect();
      setGenres([...genres]);
    } catch (error) {
      alert("Failed to save changes " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const requestBody = {
      name: selected.name,
    };

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

      const newGenre = await response.json();
      deselect();
      setGenres([...genres, newGenre]);
      setAlertMessage(`Genre ${selected.name} added successfully`);
    } catch (error) {
      setAlertMessage("Failed to add genre " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:8000/api/genres/${selected.genreID}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const newGenres = genres.filter(
        (genre) => genre.genreID !== selected.genreID
      );
      setAlertMessage(`Genre ${selected.name} deleted successfully`);
      deselect();
      setGenres([...newGenres]);
    } catch (error) {
      setAlertMessage(`Failed to delete genre ${selected.name} ` + error);
    } finally {
      setLoading(false);
    }
  };

  const isInvalid = selected.name.length === 0;

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ width: "100%", height: "100%" }}
    >
      <Box sx={{ width: "20%" }} onClick={(e) => e.stopPropagation()}>
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
          {genres.map((genre, index) =>
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
                onClick={() => setSelected({ ...genre })}
              >
                {genre.name}
              </ListItemButton>
            )
          )}
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
        ) : selected.genreID === null ? (
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{ m: "10px " }}
            disabled={isInvalid}
          >
            Add
          </Button>
        ) : (
          <Stack direction="row">
            <Button
              variant="contained"
              onClick={handleSaveChanges}
              sx={{ m: "10px " }}
              disabled={selected.name === original?.name || isInvalid}
            >
              Update
            </Button>
            <Button
              variant="contained"
              onClick={() => setDialogOpen(true)}
              sx={{ m: "10px " }}
            >
              Delete
            </Button>

            <Dialog open={dialogOpen} onClose={handleDialogClose}>
              <DialogTitle>
                ARE YOU SURE YOU WANT TO DELETE THIS GENRE?
              </DialogTitle>
              <DialogContent>This action is irreversible</DialogContent>
              <DialogActions>
                <Button onClick={handleConfirmDelete}>YES</Button>
                <Button onClick={handleDialogClose} color="error" autoFocus>
                  NO
                </Button>
              </DialogActions>
            </Dialog>
          </Stack>
        )}
      </Box>
    </Box>
  );
};

export default transition(EditGenres);
