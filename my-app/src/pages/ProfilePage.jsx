import React from 'react';
import { useKeycloak } from '@react-keycloak/web';

const ProfilePage = () => {
    const { keycloak } = useKeycloak();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow-lg" style={{ maxWidth: '600px', width: '100%' }}>
                <div className="card-body">
                    <h1 className="card-title text-center mb-4">Profile Page</h1>
                    <table className="table table-striped">
                        <tbody>
                        <tr>
                            <th scope="row">Username</th>
                            <td>{keycloak.tokenParsed?.preferred_username}</td>
                        </tr>
                        <tr>
                            <th scope="row">Name</th>
                            <td>{keycloak.tokenParsed?.given_name}</td>
                        </tr>
                        <tr>
                            <th scope="row">Last Name</th>
                            <td>{keycloak.tokenParsed?.family_name}</td>
                        </tr>
                        <tr>
                            <th scope="row">Email</th>
                            <td>{keycloak.tokenParsed?.email}</td>
                        </tr>
                        {/* Add more fields as needed */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
