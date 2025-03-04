import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import DocumentsPage from "./DocumentsPage";
import CandidatesPage from "./CandidatesPage";
import CandidateProfile from "./Components/Candidates/CandidateProfile";
import EditCandidate from "./Components/Candidates/EditCandidate";
import JobOfferPage from "./JobOfferPage"; // Import JobOfferPage
import "./App.css";

const App = () => {
  return (
    <Router>
      <div>
        <header className="app-header">
          <h1>Management System</h1>
          <nav className="nav-bar">
            <ul className="nav-list">
              <li><Link to="/" className="nav-item">Home</Link></li>
              <li><Link to="/candidates" className="nav-item">Candidates</Link></li>
              <li><Link to="/documents" className="nav-item">Documents</Link></li>
              <li><Link to="/job-offers" className="nav-item">Job Offers</Link></li>
            </ul>
          </nav>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<h2>Welcome to the Management System</h2>} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:candidateId" element={<CandidateProfile />} />
            <Route path="/candidates/:candidateId/edit" element={<EditCandidate />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/job-offers" element={<JobOfferPage />} /> {/* New Job Offer Page */}
          </Routes>
        </main>

        <footer>
          <p>© 2024 Management System</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
