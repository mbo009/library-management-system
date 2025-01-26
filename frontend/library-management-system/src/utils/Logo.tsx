import React from "react";
import { Box, Avatar, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

interface LogoProps {
  padding?: number;
  scalingConstant?: number;
}

const Logo: React.FC<LogoProps> = ({ padding = 5, scalingConstant = 1 }) => {
  const navigate = useNavigate();

  return (
    <Box p={padding}>
      <Box display="flex" justifyContent="center" alignItems="center">
        <Paper
          elevation={3}
          onClick={() => navigate("/")}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 120 * scalingConstant,
            height: 120 * scalingConstant,
            borderRadius: "50%",
            bgcolor: "white",
            cursor: "pointer",
            transition: "background-color 0.3s",
            zIndex: 10,
            animation:
              "float 12s ease-in-out infinite, rotate 12s ease-in-out infinite",
            "&:hover": {
              bgcolor: "grey.300",
            },
            "&:active": {
              bgcolor: "grey.400",
            },
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0)",
              },
              "50%": {
                transform: "translateY(-20px)",
              },
            },
            "@keyframes rotate": {
              "0%, 100%": {
                transform: "rotate(0deg)",
              },
              "25%": {
                transform: "rotate(-10deg)",
              },
              "50%": {
                transform: "rotate(0deg)",
              },
              "75%": {
                transform: "rotate(10deg)",
              },
            },
          }}
        >
          <Avatar
            src={logo}
            alt="Logo"
            sx={{ width: 100 * scalingConstant, height: 100 * scalingConstant }}
          />
        </Paper>
      </Box>
    </Box>
  );
};

export default Logo;
