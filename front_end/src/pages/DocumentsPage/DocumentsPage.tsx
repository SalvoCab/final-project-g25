import React from 'react';
import DocumentsList from '../../components/Documents/DocumentsList';
import UploadDocument from '../../components/Documents/UploadDocument';
import './DocumentsPage.css';

const DocumentsPage: React.FC = () => {
    return (
        <div className="documents-page">
            <header className="documents-header">
                <h1>Document Management</h1>
            </header>

            <div className="documents-content">
                <aside className="upload-section">
                    <UploadDocument />
                </aside>

                <section className="list-section">
                    <DocumentsList />
                </section>
            </div>
        </div>
    );
};

export default DocumentsPage;