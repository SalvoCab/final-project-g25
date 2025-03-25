import React from "react";
import "./JobProposalList.css"; // Import CSS file

interface JobProposal {
    id: string;
    description: string;
    state: string;
    notes?: string | null;
    duration: number;
    value?: number | null;
}

interface JobProposalListProps {
    proposals: JobProposal[];
}

const JobProposalList: React.FC<JobProposalListProps> = ({ proposals }) => {
    return (
        <div className="job-list-container">
            <h2>Job Proposals</h2>
            {proposals.length === 0 ? (
                <p className="no-data">No job proposals submitted.</p>
            ) : (
                <ul>
                    {proposals.map((proposal) => (
                        <li key={proposal.id} className="job-card">
                            <strong>{proposal.description}</strong>
                            <p><strong>State:</strong> {proposal.state}</p>
                            <p>Duration: {proposal.duration} days</p>
                            <p>Value: ${proposal.value ?? "N/A"}</p>
                            {proposal.notes && <p><strong>Notes:</strong> {proposal.notes}</p>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default JobProposalList;
