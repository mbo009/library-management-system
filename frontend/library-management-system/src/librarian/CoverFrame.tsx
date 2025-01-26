import React from "react";
import { Box, Button, Stack, Tooltip } from "@mui/material";
import default_cover from "../assets/default_cover.jpg";
import { MEDIA_BASE_URL } from "../config";

interface Size {
  width: number;
  height: number;
}

interface CoverPhotoComponentProps {
  selectedCoverPhoto: File | null;
  book: { cover_url: string };
  handleMediaChanged?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  editable?: boolean;
  size?: Size;
}

const CoverPhotoComponent: React.FC<CoverPhotoComponentProps> = ({
  selectedCoverPhoto,
  book,
  handleMediaChanged,
  editable = true,
  size,
}) => {
  return (
    <Stack direction="column" gap={2}>
      <Box
        sx={{
          width: size ? size.width : "420px",
          height: size ? size.height : "630px",
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
              : book.cover_url !== "/covers/null"
              ? `${MEDIA_BASE_URL}${book.cover_url}`
              : default_cover
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
        {editable && (
          <Tooltip title="ADD COVER IMAGE" placement="top">
            <Button
              variant="contained"
              component="label"
              sx={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "48px",
                height: "48px",
                minWidth: "auto",
                padding: "0",
                borderRadius: "50%",
                backgroundColor: "#fff",
                color: "#000",
                fontSize: "24px",
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
        )}
      </Box>
    </Stack>
  );
};

export default CoverPhotoComponent;
