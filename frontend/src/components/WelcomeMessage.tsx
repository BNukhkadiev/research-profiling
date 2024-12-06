import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

function WelcomeMessage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          mb: 2,
          textAlign: "center",
          color: "#2c2f57", // Dark blue to match the logo
        }}
      >
        Mannheim View
      </Typography>

      <Paper
        elevation={3}
        sx={{
          maxWidth: "600px",
          padding: 3,
          borderRadius: "15px",
          backgroundColor: "#f8f8f8", // Slightly lighter than the background
          textAlign: "center",
        }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          Welcome to Mannheim View
        </Typography>
        <Typography variant="body1" sx={{ color: "#555555" }}>
          Your all-in-one platform for exploring detailed researcher profiles,
          publications, and contributions. Discover everything you need about a
          researcher’s work in one place!
        </Typography>
      </Paper>
    </Box>
  );
}

export default WelcomeMessage;
