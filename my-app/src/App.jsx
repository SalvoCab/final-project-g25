import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RedirectPage from "./pages/RedirectPage.jsx";
import {useKeycloak} from "@react-keycloak/web";

const App = () => {
    const { keycloak } = useKeycloak();

    return (
        <>
            <Navbar/>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route
                    path="/login"
                    element={keycloak.authenticated ? <Navigate to="/profile"/> : <LoginPage/>}
                    //keycloak1.authenticated ? <Navigate to="/profile"/> :
                />
                <Route
                    path="/redirect"
                    element={<RedirectPage/>}
                    //keycloak.authenticated ? <Navigate to="/profile"/> :
                />
                <Route
                    path="/profile"
                    element={keycloak.authenticated ? <ProfilePage/> : <Navigate to="/login"/>}
                />
            </Routes>
        </>
    );
};

export default App;