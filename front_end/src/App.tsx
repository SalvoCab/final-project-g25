import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Navbar from './components/navbar/navbar.tsx';
import ProfilePage from './pages/profilePage/profilePage.tsx';

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
                const me = await res.json() as MeInterface;
                setMe(me);
            } catch (error) {
                setMe(null);
            }
        };
        fetchMe().then();
    }, []);

    return (
        <Router>
            <Navbar me={me} />
            {me && me.principal ? (
                <Routes>
                    <Route path="/" element={<div>
                        <h1>Home Page</h1>

                    </div>} />
                    <Route path="/profile" element={<ProfilePage me={me} />} />
                </Routes>
            ) : (
                <div className="d-flex justify-content-center align-items-center vh-100">
                    <h2>Login to see your profile</h2>
                </div>
            )}
        </Router>
    );
}

export default App;
