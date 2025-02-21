import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import SearchResultsPage from "./pages/SearchResultsPage";
<<<<<<< HEAD
import "./app.css"; 
=======
import "./App.css"; // Import the CSS file
>>>>>>> origin/bagas_branch
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
<<<<<<< HEAD
        <Route path="/search" element={<SearchResultsPage />} />{" "}
        <Route path="/profile" element={<ResearcherProfilePage />} />
        <Route
          path="/compare-researchers"
          element={<CompareResearchersPage />}
        />
        {}
=======
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/profile/:pid" element={<ResearcherProfilePage />} /> {/* Updated Route */}
        <Route path="/compare-researchers" element={<CompareResearchersPage />} />
        <Route path="/publication/:publicationId" element={<PublicationDetailsPage />} />
>>>>>>> origin/bagas_branch
      </Routes>
    </Router>
  );
}

export default App;
