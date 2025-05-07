import React from 'react';
import { MeInterface } from '../../App.tsx';
import { Link } from 'react-router-dom';

interface NavbarProps {
    me: MeInterface | null;
}

const Navbar: React.FC<NavbarProps> = ({ me }) => {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">Job Placement</Link>
                <div className="collapse navbar-collapse d-flex justify-content-end">
                    <ul className="navbar-nav ml-auto">
                        {me && me.principal &&
                            <>
                                <li className="nav-item">
                                    <form method="post" action={me.logoutUrl}>
                                        <Link className="nav-link" to="/profile">{me.name}</Link>
                                        <input type="hidden" name="_csrf" value={me.xsrfToken}/>
                                        <button type="submit" className="btn btn-outline-light">Logout</button>
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
                            <button className="btn btn-outline-light"
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
