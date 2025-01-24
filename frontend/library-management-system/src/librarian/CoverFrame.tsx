import React from "react";
import { Box, Button, Stack, Tooltip } from "@mui/material";

interface CoverPhotoComponentProps {
  selectedCoverPhoto: File | null;
  book: { coverPhoto: string };
  handleMediaChanged: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CoverPhotoComponent: React.FC<CoverPhotoComponentProps> = ({
  selectedCoverPhoto,
  book,
  handleMediaChanged,
}) => {
  return (
    <Stack direction="column" gap={2}>
      <Box
        sx={{
          width: "420px",
          height: "630px",
          position: "relative",
          backgroundColor: "#f0f0f0",
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <img
          src={
            selectedCoverPhoto
              ? URL.createObjectURL(selectedCoverPhoto)
              : book.coverPhoto
          }
          alt="Cover"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />

        <Tooltip title="ADD COVER IMAGE" placement="top">
          <Button
            variant="contained"
            component="label"
            sx={{
              position: "absolute",
              top: "16px",
              right: "16px",
              width: "48px", // Set width and height to make it a circle
              height: "48px",
              minWidth: "auto",
              padding: "0", // No padding, just the "+" sign
              borderRadius: "50%", // Makes it circular
              backgroundColor: "#fff",
              color: "#000",
              fontSize: "24px", // Larger font size for the "+"
              fontWeight: "bold",
              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            +
            <input type="file" hidden onChange={handleMediaChanged} />
          </Button>
        </Tooltip>
      </Box>
    </Stack>
  );
};

export default CoverPhotoComponent;
