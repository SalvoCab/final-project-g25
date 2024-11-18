import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter, BrowserRouter as Router} from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import { ReactKeycloakProvider } from '@react-keycloak/web';
import Keycloak from "keycloak-js";


const kc = new Keycloak({
    url: 'http://localhost:9095/',
    realm: 'kc1',
    clientId: 'kc1client',
});


ReactDOM.render(
    <ReactKeycloakProvider authClient={kc}>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ReactKeycloakProvider>,
    document.getElementById('root')
);
