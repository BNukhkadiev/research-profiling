import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import "./app.css"; 
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import CompareResearchersPage from "./pages/CompareResearchersPage";
import LoginPage from "./pages/LoginPage";
import LogoutPage from "./pages/LogoutPage"; 
import SignupPage from "./pages/SignupPage";



function App() {
  return (
    <Router>
      <Header />
      <Routes>
        
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/logout" element={<LogoutPage />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />{" "}
        <Route path="/profile" element={<ResearcherProfilePage />} />
        <Route
          path="/compare-researchers"
          element={<CompareResearchersPage />}
        />
        {}
      </Routes>
    </Router>
  );
}

export default App;
