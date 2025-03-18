import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        <Route
          path="/profile/:name"
          element={<ResearcherProfilePage key={window.location.pathname} />}
        />{" "}
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
