// src/App.tsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ResearcherProfilePage from "./pages/ResearcherProfilePage";
import CompareResearchersPage from "./pages/CompareResearchersPage";
import PublicationDetailsPage from "./pages/PublicationDetailsPage";
import SettingsPage from "./pages/SettingsPage"; 
import "./App.css";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LogoutPage from "./pages/LogoutPage";

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile/:name" element={<ResearcherProfilePage />} />{" "}
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
        <Route path="/profile/:pid" element={<ResearcherProfilePage />} />
        <Route path="/compare-researchers" element={<CompareResearchersPage />} />
        <Route path="/publication/:publicationId" element={<PublicationDetailsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </Router>
  );
}

export default App;
