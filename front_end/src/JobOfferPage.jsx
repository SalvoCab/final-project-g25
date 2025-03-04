import React, { useState } from "react";
import JobProposalForm from "./Components/JobOffer/JobProposalForm";
import JobProposalList from "./Components/JobOffer/JobProposalList";
import "./JobOfferPage.css"; // Import CSS file for styling

const JobOfferPage = () => {
  const [proposals, setProposals] = useState([]);

  const handleAddProposal = (newProposal) => {
    setProposals([...proposals, newProposal]);
  };

  return (
    <div className="job-offer-container">
      <h1 className="page-title">Job Offers</h1>
      <div className="job-offer-content">
        {/* Left side - Job Proposal Form */}
        <div className="job-form-section">
          <JobProposalForm onSubmit={handleAddProposal} />
        </div>

        {/* Right side - Job Proposal List */}
        <div className="job-list-section">
          <JobProposalList proposals={proposals} />
        </div>
      </div>
    </div>
  );
};

export default JobOfferPage;
