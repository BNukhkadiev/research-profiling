import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Link } from "@mui/material";

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to the login page after 10 seconds
    setTimeout(() => {
      navigate("/login");
    }, 10000);
  }, [navigate]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      bgcolor="#f8f9fa"
      fontFamily="Arial, sans-serif"
    >
      <Typography variant="h5" color="textPrimary" gutterBottom>
        You have been logged out.
      </Typography>
      <Link
        component="button"
        variant="body1"
        onClick={() => navigate("/login")}
        sx={{ color: "#007bff", mt: 2, textDecoration: "underline" }}
      >
        Go back to Login
      </Link>
    </Box>
  );
};

export default LogoutPage;
