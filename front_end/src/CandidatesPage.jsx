import React from 'react';
import CandidateList from './Components/Candidates/CandidateList';
import AddCandidate from './Components/Candidates/AddCandidate';
import './CandidatesPage.css';

const CandidatesPage = () => {
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
