import React from 'react';
import CandidateList from './../../components/Candidates/CandidateList.tsx';
import AddCandidate from './../../components/Candidates/AddCandidate.tsx';
import './CandidatesPage.css';

const CandidatesPage: React.FC = () => {
    return (
        <div className="candidates-page">
            <header>
                <h1>Candidates Management</h1>
            </header>
            <div className="candidates-content">
                <aside>
                    <AddCandidate />
                </aside>
                <main>
                    <CandidateList />
                </main>
            </div>
        </div>
    );
};

export default CandidatesPage;