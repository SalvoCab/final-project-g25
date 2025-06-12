import { useEffect, useState } from "react";
import {Button, Card, Form, ListGroup, Spinner, Modal} from "react-bootstrap";
import {CandidateDTO, JobOffer, UpdateCandidateDTO} from "../../objects/JobOffer.ts";
import "./JobOfferPage.css";
import {ProfessionalDTO} from "../../objects/Professional.ts";
import {listProfessionals} from "../../apis/apiProfessional.tsx";
import {
  addCandidatesToJobOffer,
  listCandidatesPhaseOne, listCandidatesPhaseTwo,
  updateCandidate,
  updateJobOfferStatus
} from "../../apis/apiJobOffer.tsx";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";
import {FaCheck, FaTimes} from "react-icons/fa";


type JobOfferPageProps = {
  jobOffer: JobOffer;
  onBack: () => void;
};

function getAbortedState(currentState: string): "AbortedOne" | "AbortedTwo" | "AbortedThree" | null {
  switch (currentState.toLowerCase()) {
    case "created":
      return "AbortedOne";
    case "selection phase":
      return "AbortedTwo";
    case "candidate proposal":
      return "AbortedThree";
    default:
      return null;
  }
}

export default function JobOfferPage({ jobOffer, onBack }: JobOfferPageProps) {
  const states = ["Created", "Selection Phase", "Candidate Proposal", "Consolidated", "Done"];

  const [localJobOffer, setLocalJobOffer] = useState(jobOffer);
  const currentIndex = states.indexOf(localJobOffer.state);


  const [showAbortModal, setShowAbortModal] = useState(false);
  const [abortNotes, setAbortNotes] = useState(localJobOffer.notes || "");
  const [professionals, setProfessionals] = useState<ProfessionalDTO[]>([]);
  const [candidates, setCandidates] = useState<CandidateDTO[]>([]);
  const [selectedProfessionals, setSelectedProfessionals] = useState<Record<number, { status: string; notes: string }>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [jobOfferNotes, setJobOfferNotes] = useState(localJobOffer.notes || "");
  const hasAcceptedCandidates = Object.values(candidates).some(c => c.status.toLowerCase() === "accepted");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [showEnroleModal, setShowEnroleModal] = useState(false);
  var selectedCandidate = localJobOffer.candidates!!.find(
      (candidate) => candidate.professional.id === localJobOffer.professional
  );
  // Carica i professionisti solo se lo stato è "Created"
  useEffect(() => {
    setLoading(true);

    if (localJobOffer.state === "Created" && localJobOffer.skills.length > 0) {
      listProfessionals({page:0,limit:20, skills:localJobOffer.skills.map(it => it.id),location:"",state:"available_for_work",keyword:""})
          .then(setProfessionals)
          .finally(() => setLoading(false));
    } else if (localJobOffer.state === "Selection Phase") {
      listCandidatesPhaseOne(localJobOffer.id)
          .then(setCandidates)
          .catch(console.error)
          .finally(() => setLoading(false));
    } else if (localJobOffer.state === "Candidate Proposal") {
      listCandidatesPhaseTwo(localJobOffer.id)
          .then(setCandidates)
          .catch(console.error)
          .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    selectedCandidate = localJobOffer.candidates!!.find(
        (candidate) => candidate.professional.id === localJobOffer.professional
    );
    console.log(localJobOffer);
  }, [localJobOffer]);

  const handleAbort = () => {
    setAbortNotes(localJobOffer.notes || "");
    setShowAbortModal(true);
  };
  const confirmAbort = async () => {
    const abortedState = getAbortedState(localJobOffer.state);
    if (!abortedState) {
      alert(`The job offer cannot be closed from the current state: (${localJobOffer.state})`);
      return;
    }

    try {
      await ensureCSRFToken();
      await updateJobOfferStatus(localJobOffer.id, {
        state: abortedState,
        notes: abortNotes,
      });
      setShowAbortModal(false);
      // await refreshJobOffer(); // ricarica se serve
      setLocalJobOffer(prev => ({
        ...prev,
        state: abortedState,
        notes: abortNotes,
      }));
    } catch (error) {
      console.error("Error while closing the job offer", error);
      alert("An error occurred while closing the job offer.");
    }
  };

  const updateNote = (id: number, note: string) => {
    setSelectedProfessionals(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: note,
      },
    }));
  };

  const updateCandidateNote = (id: number, note: string) => {
    setCandidates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        note: note,
      },
    }));
  };

  const updateCandidateState = (id: number, newState: string) => {
    setCandidates(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: newState,
      },
    }));
  };


  const toggleProfessionalSelection = (id: number) => {
    setSelectedProfessionals(prev => {
      const newState = { ...prev };
      if (newState[id]) {
        delete newState[id]; // Deselect
      } else {
        newState[id] = { status: "selected", notes: "" }; // Default selection
      }
      return newState;
    });
  };

  const handleOpenModal = () => {
    setJobOfferNotes(localJobOffer.notes || "");
    setShowModal(true);
  };
  const getCategoryStyle = (category: string): React.CSSProperties => {
    switch (category.toLowerCase()) {
      case "accepted":
        return { backgroundColor: "#d1e7dd", color: "#0f5132", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
      case "selected":
        return { backgroundColor: "#cfd5fc", color: "#052560", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
      case "refused":
      default:
        return { backgroundColor: "#f8d7da", color: "#842029", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
    }
  };
  const handleConfirmEnrole = async () => {
    if (selectedCandidateId === null) return;

    setShowEnroleModal(false);
    setSaving(true);
    setError(null);

    try {
      await ensureCSRFToken();

      const selectedCandidate = candidates[selectedCandidateId];
      if (!selectedCandidate) {
        throw new Error("Invalid selected candidate.");
      }

      const jb = await updateJobOfferStatus(localJobOffer.id, {
        state: "consolidated",
        notes: localJobOffer.notes!,
        professionalId: selectedCandidate.professional.id,
      });
      setLocalJobOffer(prev => ({
        ...prev,
        state: "Consolidated",
        value:jb.value,
        professional: selectedCandidate.professional.id
      }));

    } catch (err) {
      setError("Error while confirming the candidate.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };
  const handleConfirmSave = async () => {
    setSaving(true);
    setError(null);
    setShowModal(false);
    try {
      await ensureCSRFToken();

      if (localJobOffer.state === "Created") {
        // Prima fase: aggiunta dei candidati
        const candidatesToAdd = Object.entries(selectedProfessionals).map(([id, data]) => ({
          professionalId: parseInt(id),
          status: data.status,
          note: data.notes,
        }));
        const updatedJobOffer = await addCandidatesToJobOffer(localJobOffer.id, candidatesToAdd);

        setLocalJobOffer(updatedJobOffer);
        await ensureCSRFToken()
        await updateJobOfferStatus(localJobOffer.id, {
          state: "selection phase",
          notes: jobOfferNotes,
        });
        setLocalJobOffer(prev => ({
          ...prev,
          state: "Selection Phase",
          notes: jobOfferNotes,
        }));
      } else if (localJobOffer.state === "Selection Phase") {
        // Seconda fase: aggiornamento candidati + stato

        // Esegui update per ogni candidato
        const updatePromises = Object.entries(candidates).map(async ([, candidate]) => {
          const updatePayload: UpdateCandidateDTO = {
            note: candidate.note,
            state: candidate.status, // usa il valore locale di state
          };
          return updateCandidate(candidate.candidateId, updatePayload);
        });

        await Promise.all(updatePromises);
        await ensureCSRFToken()
        await updateJobOfferStatus(localJobOffer.id, {
          state: "candidate proposal",
          notes: jobOfferNotes,
        });
        setLocalJobOffer(prev => ({
          ...prev,
          state: "Candidate Proposal",
          notes: jobOfferNotes,
        }));
      }
    } catch (err) {
      console.error("Error during save:", err);
      setError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  return (

    <div>
      <Button variant="outline-secondary" onClick={onBack}>
        ← Back to list
      </Button>

      {/* Job offer status */}
      <div className="d-flex justify-content-center mt-4 mb-4">
        {states.map((state, index) => {
          let color = "lightgray";
          let icon = null;
          let label = state;

          const isAborted = localJobOffer.state.toLowerCase().startsWith("aborted");
          let abortedCount = 0;

          if (isAborted) {
            const match = localJobOffer.state.toLowerCase().match(/aborted(\w+)/);
            abortedCount = match
                ? { one: 1, two: 2, three: 3 }[match[1]] || 0
                : 0;

            if (index < abortedCount) {
              color = "green";
              icon = <FaCheck color="white" />;
              label = states[index];
            } else if (index === abortedCount) {
              color = "red";
              icon = <FaTimes color="white" />;
              label = "Aborted";
            } else {
              color = "lightgray";
              label = "";
            }
          } else {
            if (index <= currentIndex) {
              color = "green";
              icon = <FaCheck color="white" />;
            } else {
              color = "lightgray";
            }
          }

          let nextColor = "lightgray";
          if (index < states.length - 1) {
            if (isAborted) {
              if (index + 1 < abortedCount) nextColor = "green";
              else if (index + 1 === abortedCount) nextColor = "red";
            } else {
              nextColor = index + 1 <= currentIndex ? "green" : "lightgray";
            }
          }

          const connectorStyle = {
            width: "100px",
            height: "5px",
            alignSelf: "center",
            background:
                color === "green" && nextColor === "red"
                    ? "linear-gradient(to right, green, red)"
                    : color === "green" && nextColor === "green"
                        ? "green"
                        : "lightgray",
          };

          return (
              <div key={state} className="d-flex flex-column ">
                <div className="d-flex align-items-center">
                  <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                  >
                    {icon}
                  </div>

                  {index < states.length - 1 && (
                      <div style={connectorStyle} />
                  )}
                </div>

                <div style={{ marginTop: 5, fontSize: "0.85rem", textAlign: "start", minWidth: 60 }}>
                  {label}
                </div>
              </div>
          );
        })}
      </div>






        <Card className="mt-3">
          <Card.Body>
            <h2>{localJobOffer.description}</h2>
            <p><strong>Duration:</strong> {localJobOffer.duration} days</p>
            <p><strong>Value:</strong> €{localJobOffer.value?.toFixed(2)}</p>
            <p><strong>Skills:</strong> {localJobOffer.skills.map(it => it.skill).join(", ")}</p>
            <p><strong>Notes:</strong> {localJobOffer.notes || "Nessuna nota"}</p>
          </Card.Body>
        </Card>

        {localJobOffer.state === "Created" && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Select compatible professionals</h4>
                {loading ? (
                    <div className="text-center mt-3">
                      <Spinner animation="border" />
                    </div>
                ) : (
                    <ListGroup>
                      {professionals.map(pro => (
                          <ListGroup.Item key={pro.id}>
                            <Form.Check
                                type="checkbox"
                                label={`${pro.name} (${pro.skills.join(", ")})`}
                                checked={pro.id in selectedProfessionals}
                                onChange={() => toggleProfessionalSelection(pro.id)}
                            />
                            {pro.id in selectedProfessionals && (
                                <Form.Group className="mt-2">
                                  <Form.Label>Notes</Form.Label>
                                  <Form.Control
                                      type="text"
                                      value={selectedProfessionals[pro.id].notes}
                                      onChange={(e) => updateNote(pro.id, e.target.value)}
                                      placeholder="Add a note for this professional"
                                  />
                                </Form.Group>
                            )}
                          </ListGroup.Item>
                      ))}
                      {professionals.length === 0 && <p>No professionals found.</p>}
                    </ListGroup>
                )}
              </Card.Body>
            </Card>
        )}
        {localJobOffer.state === "Created" && (
            <div className="d-flex justify-content-start gap-2 mt-3">
              <Button variant="danger" onClick={handleAbort}>
                Abort
              </Button>
              <Button
                  variant="primary"
                  onClick={handleOpenModal}
                  disabled={Object.keys(selectedProfessionals).length === 0 || saving}
              >
                {saving ? <Spinner size="sm" animation="border" /> : "Save"}
              </Button>
            </div>
        )}
        {localJobOffer.state === "Selection Phase" && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Candidates under evaluation</h4>
                <ListGroup>
                  {Object.entries(candidates).map(([id, data]) => {
                    const candidate: CandidateDTO | undefined = Object.values(candidates).find(
                        (c) => c.professional.id === data.professional.id
                    );
                    if (!candidate) return null;
                    return (
                        <ListGroup.Item key={id}>
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-start mb-2">
                            <div className="mb-2 mb-md-0 flex-grow-1 me-md-3">
                              <p className="mb-1">
                                <b>{candidate.professional.name} {candidate.professional.surname}</b>{" "}
                                <span style={getCategoryStyle(candidate.status)}>{candidate.status}</span>
                              </p>
                              <p><b>Daily rate:</b> {candidate.professional.dailyRate.toFixed(2)} €</p>
                              <p><b>Location:</b> {candidate.professional.location}</p>
                              <p><b>Skills:</b> {candidate.professional.skills.join(", ")}</p>
                              <Form.Control
                                  as="textarea"
                                  rows={3}
                                  className="mt-2 w-100"
                                  value={data.note}
                                  onChange={(e) => updateCandidateNote(parseInt(id), e.target.value)}
                                  placeholder="Add a note for this professional"
                              />
                            </div>
                            <div className="btn-group">
                              <Button
                                  variant="outline-primary"
                                  onClick={() => updateCandidateState(parseInt(id), "Accepted")}
                              >
                                Accept
                              </Button>
                              <Button
                                  variant="outline-danger"
                                  onClick={() => updateCandidateState(parseInt(id), "Refused")}
                              >
                                Refuse
                              </Button>
                            </div>
                          </div>
                        </ListGroup.Item>
                    );
                  })}

                  {Object.keys(candidates).length === 0 && <p>No candidates available.</p>}
                </ListGroup>
              </Card.Body>
            </Card>
        )}

        {localJobOffer.state === "Selection Phase" && (
            <div className="d-flex justify-content-start gap-2 mt-3">
              <Button variant="danger" onClick={handleAbort}>
                Abort
              </Button>
              <Button
                  className="btn-custom"
                  onClick={handleOpenModal}
                  disabled={!hasAcceptedCandidates || saving}
              >
                {saving ? <Spinner size="sm" animation="border" /> : "Save"}
              </Button>
            </div>
        )}
        {localJobOffer.state === "Candidate Proposal" && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Select a candidate to hire</h4>
                {loading ? (
                    <div className="text-center mt-3">
                      <Spinner animation="border" />
                    </div>
                ) : (
                    <Form>
                      <ListGroup>
                        {Object.entries(candidates).map(([id, candidate]) => (
                            <ListGroup.Item key={id}>
                              <Form.Check
                                  type="radio"
                                  name="selectedCandidate"
                                  id={`radio-${id}`}
                                  label={
                                    <>
                                      <strong>{candidate.professional.name} {candidate.professional.surname}</strong> —
                                      <span className="ms-2" style={getCategoryStyle(candidate.status)}>{candidate.status}</span>
                                      <br />
                                      <small><b>Daily rate:</b> {candidate.professional.dailyRate.toFixed(2)} € | <b>Location:</b> {candidate.professional.location}</small>
                                      <br />
                                      <small><b>Skills:</b> {candidate.professional.skills.join(", ")}</small>
                                      <br />
                                      <small><b>Notes:</b> {candidate.note || "No notes"}</small>
                                    </>
                                  }
                                  checked={selectedCandidateId === parseInt(id)}
                                  onChange={() => setSelectedCandidateId(parseInt(id))}
                              />
                            </ListGroup.Item>
                        ))}
                        {Object.keys(candidates).length === 0 && (
                            <p className="mt-3">No candidates available.</p>
                        )}
                      </ListGroup>
                    </Form>
                )}
              </Card.Body>
            </Card>
        )}

        {localJobOffer.state === "Candidate Proposal" && (
            <div className="d-flex justify-content-start gap-2 mt-3">
              <Button variant="danger" onClick={handleAbort}>
                Abort
              </Button>
              <Button
                  variant="success"
                  disabled={selectedCandidateId === null}
                  onClick={() => setShowEnroleModal(true)}
              >
                Enrole
              </Button>
            </div>
        )}
        {selectedCandidate &&(
            <Card className="mt-4">
              <Card.Body>
                <h4>Selected professional</h4>
                <p><strong>Name:</strong> {selectedCandidate.professional.name} {selectedCandidate.professional.surname}</p>
                <p><strong>Daily rate:</strong> €{selectedCandidate.professional.dailyRate.toFixed(2)}</p>
                <p><strong>Location:</strong> {selectedCandidate.professional.location}</p>
                <p><strong>Skills:</strong> {selectedCandidate.professional.skills.join(", ")}</p>
              </Card.Body>
            </Card>
        )}
        {localJobOffer.state === "Consolidated" && (
            <div className="d-flex justify-content-start gap-2 mt-4">
              <Button variant="success" onClick={async () => {
                setSaving(true);
                try {
                  await ensureCSRFToken();
                  await updateJobOfferStatus(localJobOffer.id, {
                    state: "done",
                    notes: localJobOffer.notes || "",
                    professionalId: localJobOffer.professional
                  });
                  setLocalJobOffer(prev => ({
                    ...prev,
                    state: "Done",
                  }));
                } catch (err) {
                  console.error("Error:", err);
                  alert("Error while completing the job offer.");
                } finally {
                  setSaving(false);
                }
              }}>
                {saving ? <Spinner size="sm" animation="border" /> : "Close Job Offer"}
              </Button>
            </div>
        )}
        {error && <p className="text-danger mt-2">{error}</p>}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit job offer notes</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                  as="textarea"
                  rows={4}
                  value={jobOfferNotes}
                  onChange={(e) => setJobOfferNotes(e.target.value)}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSave}>
              Save and Confirm
            </Button>
          </Modal.Footer>
        </Modal>

      <Modal show={showEnroleModal} onHide={() => setShowEnroleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Hiring</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You are about to <strong>permanently assign</strong> the selected candidate to this job offer.<br />
          All other candidates will automatically be <strong>discarded</strong>.<br /><br />
          Do you want to proceed?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEnroleModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => handleConfirmEnrole()}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showAbortModal} onHide={() => setShowAbortModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Close Job Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to close this job offer? You can edit the notes before confirming.</p>
          <Form.Group controlId="abortNotes">
            <Form.Label>Notes</Form.Label>
            <Form.Control
                as="textarea"
                rows={4}
                value={abortNotes}
                onChange={(e) => setAbortNotes(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAbortModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmAbort}>
            Confirm Closure
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
