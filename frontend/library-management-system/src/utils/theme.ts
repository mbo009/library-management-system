import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#595e71",
    },
    secondary: {
      main: "#b9986e",
    },
    background: {
      default: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: "600",
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: "600",
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: "600",
    },
    h4: {
      fontSize: "1.2rem",
      fontWeight: "500",
    },
  },
});

export default theme;
