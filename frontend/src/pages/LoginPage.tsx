import React, { useState } from "react";
import { useLoginMutation } from "../react-query/useLoginMutation";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // For redirecting after login

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();
  const navigate = useNavigate(); // Hook for redirection

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          console.log("Login successful! Token:", data.token);
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          navigate("/");
        },
        onError: (error) => {
          console.error("Login failed:", error.message);
        },
      }
    );
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loginMutation.isPending}
            sx={{ mt: 2, mb: 1 }}
          >
            {loginMutation.isPending ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </Box>

        {/* Links for "Forgot Password" and "Sign Up" */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
          <Link href="/forgot-password" underline="hover">
            Forgot Password?
          </Link>
          <Typography>|</Typography>
          <Link href="/signup" underline="hover">
            Sign Up?
          </Link>
        </Box>

        {/* Error Message */}
        {loginMutation.isError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {loginMutation.error instanceof Error
              ? loginMutation.error.message
              : "An error occurred"}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;