import React from 'react';
import { MeInterface } from '../../App.tsx';

interface ProfileProps {
    me: MeInterface | null;
}

const ProfilePage: React.FC<ProfileProps> = ({ me }) => {
    if (!me || !me.principal) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
                <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
                    <div className="card-body">
                        <h1 className="card-title text-center mb-4">Profile Page</h1>
                        <p className="text-center">User information is not available.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
                <div className="card-body">
                    <h1 className="card-title text-center mb-4">Profile Page</h1>
                    <table className="table table-striped">
                        <tbody>
                        <tr>
                            <th scope="row">Username</th>
                            <td>{me.name}</td>
                        </tr>
                        <tr>
                            <th scope="row">Name</th>
                            <td>{me.principal.givenName}</td>
                        </tr>
                        <tr>
                            <th scope="row">Last Name</th>
                            <td>{me.principal.familyName}</td>
                        </tr>
                        <tr>
                            <th scope="row">Email</th>
                            <td>{me.principal.email}</td>
                        </tr>
                        <tr>
                            <th scope="row">Role</th>
                            <td>{me.role}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
