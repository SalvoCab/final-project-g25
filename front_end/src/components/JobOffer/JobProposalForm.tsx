import React, { useState } from "react";
import "./JobProposalForm.css"; // Import CSS file

interface JobProposal {
  id: string;
  description: string;
  state: string;
  notes: string | null;
  duration: number;
  value: number | null;
}

interface JobProposalFormProps {
  onSubmit: (proposal: JobProposal) => void;
}

const JobProposalForm: React.FC<JobProposalFormProps> = ({ onSubmit }) => {
  const [description, setDescription] = useState<string>("");
  const [state, setState] = useState<string>("Candidate Proposal"); // Default state
  const [notes, setNotes] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !duration || !state) {
      alert("Description, duration, and state are required.");
      return;
    }

    const newProposal: JobProposal = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      state,
      notes: notes || null, // Allow null value for optional field
      duration: parseInt(duration, 10),
      value: value ? parseFloat(value) : null, // Convert to float if entered
    };

    onSubmit(newProposal);

    // Reset form fields
    setDescription("");
    setState("Candidate Proposal");
    setNotes("");
    setDuration("");
    setValue("");
  };

  return (
      <div className="job-form-container">
        <h2>Submit a Job Proposal</h2>
        <form onSubmit={handleSubmit}>
          <label>Description:</label>
          <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
          />

          <label>State:</label>
          <select value={state} onChange={(e) => setState(e.target.value)} required>
            <option value="Selection Phase">Selection Phase</option>
            <option value="Aborted">Aborted</option>
            <option value="Candidate Proposal">Candidate Proposal</option>
            <option value="Consolidated">Consolidated</option>
            <option value="Done">Done</option>
          </select>

          <label>Duration (days):</label>
          <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
          />

          <label>Value ($):</label>
          <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
          />

          <label>Notes:</label>
          <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
          ></textarea>

          <button type="submit">Submit Proposal</button>
        </form>
      </div>
  );
};

export default JobProposalForm;
