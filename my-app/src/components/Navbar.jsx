import React from 'react';
import {Link, NavLink, useNavigate} from 'react-router-dom';
import { useKeycloak } from '@react-keycloak/web';

const Navbar = () => {
    const { keycloak } = useKeycloak();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <NavLink className="navbar-brand" to="/">Home</NavLink>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav ms-auto">
                    {keycloak.authenticated ? (
                        <>
                            <li className="nav-item">
                                <NavLink className="nav-link" to="/profile">Profile</NavLink>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-danger nav-link" onClick={() => keycloak.logout()}>Logout</button>
                            </li>
                        </>
                    ) : (
                        <li className="nav-item">
                            <NavLink className="nav-link" to="/login">Login</NavLink>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
