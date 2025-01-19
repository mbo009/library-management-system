import { ThemeProvider, CssBaseline } from "@mui/material";
import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import theme from "./utils/theme.ts";
import Login from "./Login";
import { AnimatePresence } from "framer-motion";
import WrappedHome from "./Home.tsx";
import EditBook from "./librarian/Book.tsx";
import EditAuthor from "./librarian/Author.tsx";
import EditGenres from "./librarian/Genres.tsx";
import EditLanguages from "./librarian/Languages.tsx";
import Book from "./Book.tsx";


function App() {
  const location = useLocation();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<WrappedHome />} />
          <Route path="/book" element={<Book />} />
          <Route path="/librarian/new_book" element={<EditBook create={true} />} />
          <Route path="/librarian/book" element={<EditBook create={false} />} />
          <Route path="/librarian/new_author" element={<EditAuthor create={true} />} />
          <Route path="/librarian/author" element={<EditAuthor create={false} />} />
          <Route path="/librarian/genres" element={<EditGenres />} />
          <Route path="/librarian/languages" element={<EditLanguages />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
