import React, { useRef } from 'react';
import { MeInterface } from '../../App.tsx';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_h.png';
import './Navbar.css';
import Cookies from "js-cookie";

interface NavbarProps {
    me: MeInterface | null;
}

const Navbar: React.FC<NavbarProps> = ({ me }) => {
    const logoutFormRef = useRef<HTMLFormElement>(null);
    const csrfInputRef = useRef<HTMLInputElement>(null);

    const handleLogoutClick = () => {
        const token = Cookies.get("XSRF-TOKEN");
        if (csrfInputRef.current) {
            csrfInputRef.current.value = token || '';
        }
        logoutFormRef.current?.submit();
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-custom">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/ui">
                    <img
                        src={logo}
                        alt="Job Placement Logo"
                        height="50"
                        className="d-inline-block align-top"
                    />
                </Link>

                <div className="collapse navbar-collapse d-flex justify-content-end">
                    <ul className="navbar-nav ml-auto d-flex align-items-center gap-3">
                        {me && me.principal && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/job-offers">Vai</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/job-offers-list">Lista</Link>
                                </li>
                                <li className="nav-item nav-link">
                                    Welcome <b>{me.principal.givenName} {me.principal.familyName} <i>({me.name})</i></b>
                                </li>
                                <li className="nav-item">
                                    <Link className="btn btn-custom" to="/profile">
                                        Profile
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <form method="post" action={me.logoutUrl} ref={logoutFormRef} className="mb-0">
                                        <input type="hidden" name="_csrf" ref={csrfInputRef} />
                                        <button
                                            type="button"
                                            className="btn btn-custom-outline"
                                            onClick={handleLogoutClick}
                                        >
                                            Logout
                                        </button>
                                    </form>
                                </li>
                            </>
                        )}
                        {me && me.principal == null && me.loginUrl && (
                            <li className="nav-item">
                                <button
                                    className="btn btn-custom-outline"
                                    onClick={() => window.location.href = me.loginUrl}
                                >
                                    Login
                                </button>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
