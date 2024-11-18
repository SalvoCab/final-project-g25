import React, {useEffect, useState} from 'react';
import "../core/API/auth.js";

const RedirectPage = () => {
    return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <button className="btn btn-success">
                Redirect page
            </button>
        </div>
    );
}

export default RedirectPage;
