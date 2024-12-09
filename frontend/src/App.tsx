import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import "./app.css"; // Import the CSS file
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import CompareResearchersPage from "./pages/CompareResearchersPage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />{" "}
        <Route path="/profile" element={<ResearcherProfilePage />} />
        <Route
          path="/compare-researchers"
          element={<CompareResearchersPage />}
        />
        {/* Add this */}
      </Routes>
    </Router>
  );
}

export default App;
