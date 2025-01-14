import { ThemeProvider, CssBaseline } from "@mui/material";
import "./App.css";
import { Route, Routes, useLocation } from "react-router-dom";
import theme from "./utils/theme.ts";
import Login from "./Login";
import { AnimatePresence } from "framer-motion";
import WrappedHome from "./Home.tsx";

function App() {
  const location = useLocation();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<WrappedHome />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
