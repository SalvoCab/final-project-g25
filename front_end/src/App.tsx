import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import "./App.css";
import Navbar from "./components/navbar/navbar";
import ProfilePage from "./pages/profilePage/profilePage";
import DocumentsPage from "./pages/DocumentsPage/DocumentsPage.tsx";
import CandidatesPage from "./pages/candidatesPage/CandidatesPage.tsx";
import CandidateProfile from "./components/Candidates/CandidateProfile.tsx";
import EditCandidate from "./components/Candidates/EditCandidate.tsx";
import JobOfferPage from "./pages/jobOfferPage/JobOfferPage";

export interface MeInterface {
    name: string;
    loginUrl: string;
    logoutUrl: string;
    principal: {
        username: string;
        givenName: string;
        familyName: string;
        email: string;
    } | null;
    xsrfToken: string;
}

function App() {
    const [me, setMe] = useState<MeInterface | null>(null);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch("/me");
                const meData = (await res.json()) as MeInterface;
                setMe(meData);
            } catch (error) {
                setMe(null);
            }
        };
        fetchMe();
    }, []);

    return (
        <Router>
            <Navbar me={me} />
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
                {me && me.principal ? (
                    <Routes>
                        <Route path="/" element={<h2>Welcome to the Management System</h2>} />
                        <Route path="/profile" element={<ProfilePage me={me} />} />
                        <Route path="/candidates" element={<CandidatesPage />} />
                        <Route path="/candidates/:candidateId" element={<CandidateProfile />} />
                        <Route path="/candidates/:candidateId/edit" element={<EditCandidate />} />
                        <Route path="/documents" element={<DocumentsPage />} />
                        <Route path="/job-offers" element={<JobOfferPage />} />
                    </Routes>
                ) : (
                    <div className="d-flex justify-content-center align-items-center vh-100">
                        <h2>Login to see your profile</h2>
                    </div>
                )}
            </main>

            <footer>
                <p>© 2024 Management System</p>
            </footer>
        </Router>
    );
}

export default App;