import React from 'react';
import { MeInterface } from '../../App.tsx';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo_h.png';
import './Navbar.css';



interface NavbarProps {
    me: MeInterface | null;
}

const Navbar: React.FC<NavbarProps> = ({ me }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-custom">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    <img
                        src={logo}
                        alt="Job Placement Logo"
                        height="40"
                        className="d-inline-block align-top"
                    />
                </Link>

                <div className="collapse navbar-collapse d-flex justify-content-end">
                    <ul className="navbar-nav ml-auto">
                        {me && me.principal &&
                            <>
                                <li className="nav-item">
                                    <form method="post" action={me.logoutUrl}>
                                        <Link className="nav-link" to="/profile">{me.name}</Link>
                                        <input type="hidden" name="_csrf" value={me.xsrfToken}/>
                                        <button type="submit" className="btn btn-custom-outline">Logout</button>
                                    </form>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/job-offers">vai</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/job-offers-list">lista</Link>
                                </li>
                            </>
                        }
                        {me && me.principal == null && me.loginUrl &&
                            <li className="nav-item">
                                <button className="btn btn-custom-outline"
                                        onClick={() => window.location.href = me?.loginUrl}>Login
                                </button>
                            </li>
                        }
                    </ul>

                </div>
            </div>
        </nav>
    );
}

export default Navbar;
