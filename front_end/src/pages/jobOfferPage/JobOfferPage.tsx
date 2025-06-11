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
      listProfessionals(0, 20, localJobOffer.skills.map(it => it.id),"", "available_for_work")
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
      alert(`La job offer non può essere chiusa dallo stato attuale (${localJobOffer.state})`);
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
      console.error("Errore durante la chiusura della job offer", error);
      alert("Si è verificato un errore durante la chiusura della job offer.");
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
        throw new Error("Candidato selezionato non valido.");
      }

      await updateJobOfferStatus(localJobOffer.id, {
        state: "consolidated",
        notes: localJobOffer.notes!,
        professionalId: selectedCandidate.professional.id,
      });
      setLocalJobOffer(prev => ({
        ...prev,
        state: "Consolidated",
        professional: selectedCandidate.professional.id
      }));

    } catch (err) {
      setError("Errore durante la conferma del candidato.");
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
      console.error("Errore durante il salvataggio:", err);
      setError("Si è verificato un errore durante il salvataggio.");
    } finally {
      setSaving(false);
    }
  };

  return (

    <div>
      <Button variant="outline-secondary" onClick={onBack}>
        ← Torna alla lista
      </Button>

      {/* Stato della job offer */}
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
              label = states[index]; // Mantieni lo stato corretto
            } else if (index === abortedCount) {
              color = "red";
              icon = <FaTimes color="white" />;
              label = "Aborted";
            } else {
              color = "lightgray";
              label = ""; // Nessuna label dopo l’aborted
            }
          } else {
            if (index <= currentIndex) {
              color = "green";
              icon = <FaCheck color="white" />;
            } else {
              color = "lightgray";
            }
          }

          // Preparazione del connettore tra i pallini
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
                  {/* Pallino */}
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

                  {/* Connettore */}
                  {index < states.length - 1 && (
                      <div style={connectorStyle} />
                  )}
                </div>

                {/* Etichetta sotto */}
                <div style={{ marginTop: 5, fontSize: "0.85rem", textAlign: "start", minWidth: 60 }}>
                  {label}
                </div>
              </div>
          );
        })}
      </div>






  {/* Dettagli offerta */}
        <Card className="mt-3">
          <Card.Body>
            <h2>{localJobOffer.description}</h2>
            <p><strong>Durata:</strong> {localJobOffer.duration} giorni</p>
            <p><strong>Valore:</strong> €{localJobOffer.value}</p>
            <p><strong>Competenze:</strong> {localJobOffer.skills.map(it => it.skill).join(", ")}</p>
            <p><strong>Note:</strong> {localJobOffer.notes || "Nessuna nota"}</p>
          </Card.Body>
        </Card>

        {/* Sezione selezione professionisti */}
        {localJobOffer.state === "Created" && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Seleziona professionisti compatibili</h4>
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
                                  <Form.Label>Note</Form.Label>
                                  <Form.Control
                                      type="text"
                                      value={selectedProfessionals[pro.id].notes}
                                      onChange={(e) => updateNote(pro.id, e.target.value)}
                                      placeholder="Aggiungi una nota per questo professionista"
                                  />
                                </Form.Group>
                            )}
                          </ListGroup.Item>
                      ))}
                      {professionals.length === 0 && <p>Nessun professionista trovato.</p>}
                    </ListGroup>
                )}
              </Card.Body>
            </Card>
        )}
        {localJobOffer.state === "Created" && (
            <div className="d-flex justify-content-start gap-2 mt-3">
              <Button variant="danger" onClick={handleAbort}>
                Annulla
              </Button>
              <Button
                  variant="primary"
                  onClick={handleOpenModal}
                  disabled={Object.keys(selectedProfessionals).length === 0 || saving}
              >
                {saving ? <Spinner size="sm" animation="border" /> : "Salva"}
              </Button>
            </div>
        )}
        {localJobOffer.state === "Selection Phase" && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Candidati in valutazione</h4>
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
                              <p><b>Daily rate:</b> {candidate.professional.dailyRate} €</p>
                              <p><b>Location:</b> {candidate.professional.location}</p>
                              <p><b>Skills:</b> {candidate.professional.skills.join(", ")}</p>
                              <Form.Control
                                  as="textarea"
                                  rows={3}
                                  className="mt-2 w-100"
                                  value={data.note}
                                  onChange={(e) => updateCandidateNote(parseInt(id), e.target.value)}
                                  placeholder="Aggiungi una nota per questo professionista"
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

                  {Object.keys(candidates).length === 0 && <p>Nessun candidato disponibile.</p>}
                </ListGroup>
              </Card.Body>
            </Card>
        )}

        {localJobOffer.state === "Selection Phase" && (
            <div className="d-flex justify-content-start gap-2 mt-3">
              <Button variant="danger" onClick={handleAbort}>
                Annulla
              </Button>
              <Button
                  className="btn-custom"
                  onClick={handleOpenModal}
                  disabled={!hasAcceptedCandidates || saving}
              >
                {saving ? <Spinner size="sm" animation="border" /> : "Salva"}
              </Button>
            </div>
        )}
        {localJobOffer.state === "Candidate Proposal" && (
            <Card className="mt-4">
              <Card.Body>
                <h4>Seleziona un candidato da ingaggiare</h4>
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
                                      <small><b>Daily rate:</b> {candidate.professional.dailyRate} € | <b>Location:</b> {candidate.professional.location}</small>
                                      <br />
                                      <small><b>Skills:</b> {candidate.professional.skills.join(", ")}</small>
                                      <br />
                                      <small><b>Note:</b> {candidate.note || "Nessuna nota"}</small>
                                    </>
                                  }
                                  checked={selectedCandidateId === parseInt(id)}
                                  onChange={() => setSelectedCandidateId(parseInt(id))}
                              />
                            </ListGroup.Item>
                        ))}
                        {Object.keys(candidates).length === 0 && (
                            <p className="mt-3">Nessun candidato disponibile.</p>
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
                Annulla
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
                <h4>Professionista selezionato</h4>
                <p><strong>Nome:</strong> {selectedCandidate.professional.name} {selectedCandidate.professional.surname}</p>
                <p><strong>Tariffa giornaliera:</strong> €{selectedCandidate.professional.dailyRate}</p>
                <p><strong>Località:</strong> {selectedCandidate.professional.location}</p>
                <p><strong>Competenze:</strong> {selectedCandidate.professional.skills.join(", ")}</p>
              </Card.Body>
            </Card>
        )}
        {localJobOffer.state === "Consolidated" && (
            <div className="d-flex justify-content-start gap-2 mt-4">
              <Button variant="danger" onClick={handleAbort}>
                Abort
              </Button>
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
                  console.error("Errore nel completamento:", err);
                  alert("Errore durante il completamento dell'offerta.");
                } finally {
                  setSaving(false);
                }
              }}>
                {saving ? <Spinner size="sm" animation="border" /> : "Close"}
              </Button>
            </div>
        )}
        {error && <p className="text-danger mt-2">{error}</p>}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Modifica note dell'offerta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group>
              <Form.Label>Note</Form.Label>
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
              Annulla
            </Button>
            <Button variant="primary" onClick={handleConfirmSave}>
              Conferma e salva
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showEnroleModal} onHide={() => setShowEnroleModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Conferma assegnazione</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Stai per assegnare <strong>in via definitiva</strong> il candidato selezionato a questa job offer.<br />
            Tutti gli altri candidati verranno automaticamente <strong>scartati</strong>.<br /><br />
            Vuoi procedere?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEnroleModal(false)}>
              Annulla
            </Button>
            <Button variant="primary" onClick={() => handleConfirmEnrole()}>
              Conferma
            </Button>
          </Modal.Footer>
        </Modal>

      <Modal show={showAbortModal} onHide={() => setShowAbortModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chiudi Job Offer</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Sei sicuro di voler chiudere questa job offer? Puoi modificare le note prima di confermare.</p>
          <Form.Group controlId="abortNotes">
            <Form.Label>Note</Form.Label>
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
            Annulla
          </Button>
          <Button variant="danger" onClick={confirmAbort}>
            Conferma chiusura
          </Button>
        </Modal.Footer>
      </Modal>
      </div>
  );
}
