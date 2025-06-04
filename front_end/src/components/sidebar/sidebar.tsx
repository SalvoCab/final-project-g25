import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar: React.FC = () => {
    return (
        <div className="sidebar">
            <NavLink to="/job-offers-list" className={({ isActive }) => isActive ? 'active' : ''}>
                Job Offers
            </NavLink>
            <NavLink to="/contacts" className={({ isActive }) => isActive ? 'active' : ''}>
                Contacts
            </NavLink>
            <NavLink
                to="/customers"
                className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
            >
                <span className="dot" /> Customers
            </NavLink>
            <NavLink
                to="/professionals"
                className={({ isActive }) => `sidebar-subitem ${isActive ? 'active' : ''}`}
            >
                <span className="dot" /> Professionals
            </NavLink>
            <NavLink to="/messages" className={({ isActive }) => isActive ? 'active' : ''}>
                Messages
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => isActive ? 'active' : ''}>
                Analytics
            </NavLink>
        </div>
    );
};

export default Sidebar;
