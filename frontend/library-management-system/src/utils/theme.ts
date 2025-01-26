import { createTheme, ThemeOptions } from "@mui/material";
import "@fontsource/poppins/index.css";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#595e71",
    },
    secondary: {
      main: "#b9986e",
    },
    background: {
      default: "#f7f7fc",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Arial", sans-serif',
    h1: {
      fontSize: "3rem",
      fontWeight: 900,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 700,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 500,
    },
    h4: {
      fontSize: "1.2rem",
      fontWeight: 400,
    },
    body1: {
      fontSize: "1rem",
      fontWeight: 300,
    },
  },
};

const theme = createTheme(themeOptions);

export default theme;
