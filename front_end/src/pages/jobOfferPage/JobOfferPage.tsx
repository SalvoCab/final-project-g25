import React, { useState } from "react";
import JobProposalForm from "../../components/JobOffer/JobProposalForm";
import JobProposalList from "../../components/JobOffer/JobProposalList";
import "./JobOfferPage.css"; // Import CSS file for styling

interface JobProposal {
  id: string;
  description: string;
  state: string;
  notes?: string | null;
  duration: number;
  value?: number | null;
}

const JobOfferPage: React.FC = () => {
  const [proposals, setProposals] = useState<JobProposal[]>([]);

  const handleAddProposal = (newProposal: JobProposal) => {
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
