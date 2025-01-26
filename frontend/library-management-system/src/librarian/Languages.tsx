import React, { useEffect, useState } from "react";
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
import { API_BASE_URL } from "../config";

interface Language {
  languageID: number | null;
  name: string;
  shortcut: string;
}

type EditLanguagesProps = {
  languages: Array<Language>;
  setLanguages: any;
  setAlertMessage: (message: string) => void;
};

const EditLanguages: React.FC<EditLanguagesProps> = ({
  languages,
  setLanguages,
  setAlertMessage,
}) => {
  const [selected, setSelected] = useState<Language>({
    languageID: null,
    name: "",
    shortcut: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogClose = () => setDialogOpen(false);
  const handleConfirmDelete = () => {
    handleDialogClose();
    handleDelete();
  };

  const deselect = () => {
    setSelected({ languageID: null, name: "", shortcut: "" });
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/languages/`);

        if (response.ok) {
          setLanguages(await response.json());
        } else {
          alert("Failed to fetch languages");
        }
      } catch (error) {
        alert("Failed to fetch languages " + error);
      } finally {
        setLoading(false);
      }
    };

    fetchLanguages();
  }, [setLanguages]);

  let original = languages.find(
    (language) => language.languageID === selected.languageID
  );

  const handleSaveChanges = async () => {
    const requestBody = {
      name: selected.name,
      shortcut: selected.shortcut,
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/languages/${selected.languageID}/`,
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

      const index = languages.findIndex(
        (language) => language.languageID === selected.languageID
      );
      languages[index] = await response.json();
      deselect();
      setLanguages([...languages]);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const requestBody = {
      name: selected.name,
      shortcut: selected.shortcut,
    };

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/languages/`, {
        method: "POST",
        body: JSON.stringify(requestBody),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const newLanguage = await response.json();
      deselect();
      setLanguages([...languages, newLanguage]);
      setAlertMessage(`Language ${selected.name} added successfully`);
    } catch (error) {
      setAlertMessage(`Failed to add language ${selected.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const requestBody = {
      languageID: selected.languageID,
    };

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/languages/${selected.languageID}/`,
        {
          method: "DELETE",
          body: JSON.stringify(requestBody),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Status: ${response.status}`);
      }

      const newLanguages = languages.filter(
        (language) => language.languageID !== selected.languageID
      );
      setAlertMessage(`Language ${selected.name} deleted successfully`);
      deselect();
      setLanguages([...newLanguages]);
    } catch (error) {
      setAlertMessage(`Failed to delete language ${selected.name}`);
    } finally {
      setLoading(false);
    }
  };

  console.log(selected);

  const isInvalid =
    selected.name.length === 0 || selected.shortcut.length === 0;

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
          {languages.map((language, index) =>
            language.languageID === selected.languageID ? (
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
                {language.name + " (" + language.shortcut + ")"}
              </ListItem>
            ) : (
              <ListItemButton
                key={index}
                sx={{
                  backgroundColor: index % 2 === 0 ? "grey.100" : "white",
                  height: "40px",
                }}
                onClick={() => setSelected({ ...language })}
              >
                {language.name + " (" + language.shortcut + ")"}
              </ListItemButton>
            )
          )}
        </List>

        <Stack direction="row" sx={{ width: "100%" }} spacing={2}>
          <TextField
            label="Language name"
            fullWidth
            value={selected.name}
            onChange={(e) => setSelected({ ...selected, name: e.target.value })}
            variant="outlined"
            disabled={loading}
            inputProps={{ maxLength: 100 }}
          />
          <TextField
            label="Shortcut"
            value={selected.shortcut}
            onChange={(e) =>
              setSelected({ ...selected, shortcut: e.target.value })
            }
            variant="outlined"
            inputProps={{ maxLength: 10 }}
          />
        </Stack>

        {loading ? (
          <CircularProgress />
        ) : selected.languageID === null ? (
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

export default transition(EditLanguages);
