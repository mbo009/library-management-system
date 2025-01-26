import { useState, useEffect } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Typography,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/librarian_keys/`;

interface LibrarianKey {
  librarian_id: number;
  librarian_key: string;
}

interface LibrarianKeyListProps {
  librarian_id: number;
}

const LibrarianKeyList: React.FC<LibrarianKeyListProps> = ({
  librarian_id,
}) => {
  const [librarianKeys, setLibrarianKeys] = useState<LibrarianKey[]>([]);
  const [visibleKeys, setVisibleKeys] = useState<boolean[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [alertSeverity, setAlertSeverity] = useState<"success" | "error">(
    "success"
  );
  const [loading, setLoading] = useState<boolean>(false);

  const getLibrarianKeys = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("Failed to fetch keys");
      const data = await response.json();
      setLibrarianKeys(data);
      setVisibleKeys(new Array(data.length).fill(false));
    } catch (error) {
      setAlertMessage("Failed to fetch librarian keys.");
      setAlertSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getLibrarianKeys();
  }, []);

  const handleAddLibrarianKey = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ librarian_id }),
      });
      if (!response.ok) throw new Error("Failed to add key");
      const newKey = await response.json();
      setLibrarianKeys([...librarianKeys, newKey]);
      setVisibleKeys([...visibleKeys, false]);
      setAlertMessage("Librarian key added successfully!");
      setAlertSeverity("success");
    } catch (error) {
      setAlertMessage("Failed to add librarian key.");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleRemoveKey = async (index: number) => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          librarian_id: librarianKeys[index].librarian_id,
          librarian_key: librarianKeys[index].librarian_key,
        }),
      });
      if (!response.ok) throw new Error("Failed to remove key");
      const updatedKeys = [...librarianKeys];
      updatedKeys.splice(index, 1);
      setLibrarianKeys(updatedKeys);
      setVisibleKeys(visibleKeys.filter((_, i) => i !== index));
      setAlertMessage("Librarian key removed successfully!");
      setAlertSeverity("success");
    } catch (error) {
      setAlertMessage("Failed to remove librarian key.");
      setAlertSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  const handleToggleVisibility = (index: number) => {
    setVisibleKeys((prev) => {
      const newVisibleKeys = [...prev];
      newVisibleKeys[index] = !newVisibleKeys[index];
      return newVisibleKeys;
    });
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setAlertMessage("Key copied to clipboard!");
    setAlertSeverity("success");
    setSnackbarOpen(true);
  };

  return (
    <>
      <List>
        <ListSubheader>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography>Tokeny</Typography>
            <IconButton onClick={handleAddLibrarianKey} disabled={loading}>
              <AddIcon />
            </IconButton>
          </Box>
        </ListSubheader>
        <Divider />
        {librarianKeys.map((librarianKey, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={visibleKeys[index] ? librarianKey.librarian_key : "****"}
            />
            <Tooltip title="Copy Key">
              <IconButton
                onClick={() => handleCopyKey(librarianKey.librarian_key)}
              >
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={visibleKeys[index] ? "Hide Key" : "Show Key"}>
              <IconButton onClick={() => handleToggleVisibility(index)}>
                {visibleKeys[index] ? (
                  <VisibilityOffIcon />
                ) : (
                  <VisibilityIcon />
                )}
              </IconButton>
            </Tooltip>
            <Tooltip title="Remove Key">
              <IconButton onClick={() => handleRemoveKey(index)}>
                <RemoveIcon />
              </IconButton>
            </Tooltip>
          </ListItem>
        ))}
        {loading && (
          <Box display="flex" justifyContent="center" alignItems="center" p={2}>
            <CircularProgress />
          </Box>
        )}
      </List>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert severity={alertSeverity}>{alertMessage}</Alert>
      </Snackbar>
    </>
  );
};

export default LibrarianKeyList;
