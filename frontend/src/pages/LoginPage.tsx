import React, { useState } from "react";
import { useLoginMutation } from "../react-query/useLoginMutation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useLoginMutation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(
      { email, password }, // Pass the login data
      {
        onSuccess: (data) => {
          console.log("Login successful! Token:", data.token);
          // Save token to localStorage or context
          localStorage.setItem("token", data.token);
        },
        onError: (error) => {
          console.error("Login failed:", error.message);
        },
      }
    );
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loginMutation.status === "loading"}>
          {loginMutation.status === "loading" ? "Logging in..." : "Login"}
        </button>
      </form>
      {loginMutation.isError && (
        <div style={{ color: "red" }}>
          {loginMutation.error instanceof Error
            ? loginMutation.error.message
            : "An error occurred"}
        </div>
      )}
    </div>
  );
};

export default LoginPage;
