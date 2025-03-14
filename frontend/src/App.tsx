import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import "./App.css"; // Import the CSS file
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import CompareResearchersPage from "./pages/CompareResearchersPage";
import PublicationDetailsPage from "./pages/PublicationDetailsPage"; // Import the new page

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile/:pid" element={<ResearcherProfilePage />} />{" "}
        {/* Updated Route */}
        {/* Updated Route */}
        <Route
          path="/compare-researchers"
          element={<CompareResearchersPage />}
        />{" "}
        {/* Updated route */}
        <Route
          path="/publication/:publicationId"
          element={<PublicationDetailsPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
