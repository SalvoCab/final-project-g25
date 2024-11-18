import React, {useEffect, useState} from 'react';
import {useKeycloak} from '@react-keycloak/web';
import "../core/API/auth.js";
import Keycloak from "keycloak-js";
import * as httpClient from "autoprefixer";
import {useNavigate} from "react-router-dom";

const LoginPage = () => {
    // const [isLogin , setLogin] = useState(false);
    // useEffect(() => {
    //     const client = new Keycloak({
    //         url: 'http://localhost:8080/secure',
    //         realm: 'kc1',
    //         clientId: 'kc1client',
    //     });
    //
    //     client.init({onLoad: "login-required"}).then((res) => setLogin(res));
    // }, []);
    const kc = useKeycloak()

    const navigate = useNavigate();

    const handleLogin = () => {
        kc.keycloak.login().then(authenticated => {
            if (authenticated) {
                navigate('/profile');
            } else {
                console.error("Authentication failed");
            }
        }).catch(error => {
            console.error("Authentication error:", error);
        });
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <button className="btn btn-success" onClick={() => {
                handleLogin()
            }}>
                Login with Keycloak
            </button>
        </div>
    );
}

export default LoginPage;
