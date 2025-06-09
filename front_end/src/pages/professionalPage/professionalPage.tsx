import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Form, ListGroup, Modal } from 'react-bootstrap';
import {
    BsEye,
    BsGeoAlt,
    BsAward,
    BsPersonWorkspace,
    BsPencilSquare,
    BsTrash,
    BsCashStack,
    BsPersonDown
} from "react-icons/bs";
import {deleteProfessional, deleteProfessionalAndContact, listProfessionals} from "../../apis/apiProfessional";
import { ProfessionalDTO, ProfessionalDetails } from "../../objects/Professional";
import { getProfessionalDetails } from "../../apis/apiProfessional.tsx";
import { MeInterface } from "../../App";
import Select from "react-select";
import { listAllSkills } from "../../apis/apiSkill";
import { SkillDTO } from "../../objects/Skill";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";

interface ListProfessionalsProps {
    me: MeInterface | null;
}

const ListProfessionals: React.FC<ListProfessionalsProps> = ({ me }) => {
    const [professionals, setProfessionals] = useState<ProfessionalDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [availableSkills, setAvailableSkills] = useState<SkillDTO[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<{ value: number; label: string }[]>([]);
    const role = me?.role ?? "";
    const permissions = {
        canView: ["manager", "operator", "guest"],
        canAddEdit: ["manager", "operator"],
        canDelete: ["manager"]
    };

    const canAddEdit = permissions.canAddEdit.includes(role);
    const canDelete = permissions.canDelete.includes(role);

    const [filters, setFilters] = useState({
        location: "",
        state: "",
        skills: ""
    });
    const [appliedFilters, setAppliedFilters] = useState(filters);

    const [selectedProfessional, setSelectedProfessional] = useState<ProfessionalDetails | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [confirmMessage, setConfirmMessage] = useState("");
    const hasActiveFilters = Object.values(appliedFilters).some(val => val !== "");
    const showConfirmation = (message: string, onConfirm: () => void) => {
        setConfirmMessage(message);
        setConfirmAction(() => onConfirm);
        setConfirmModalVisible(true);
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        const skillIds = appliedFilters.skills
            .split(",")
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n));

        listProfessionals(page, limit, skillIds, appliedFilters.location, appliedFilters.state)
            .then((data) => {
                ensureCSRFToken();
                setProfessionals(data);
                setHasMore(data.length === limit);
            })
            .catch((err) => {
                setError(err.message || "Errore durante il caricamento dei professionisti");
                setProfessionals([]);
            })
            .finally(() => setLoading(false));
    }, [page, limit, appliedFilters]);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const skills = await listAllSkills();
                setAvailableSkills(skills);
                await ensureCSRFToken();
            } catch (err) {
                console.error("Errore caricamento skill", err);
            }
        };
        fetchSkills();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        const skillsAsString = selectedSkills.map(s => s.value).join(","); // "1,2,3"
        setAppliedFilters({ ...filters, skills: skillsAsString });
        setPage(0);
    };


    const handleClearFilters = () => {
        const cleared = { location: "", state: "", skills: "" };
        setFilters(cleared);
        setAppliedFilters(cleared);
        setSelectedSkills([]);
        setPage(0);
    };

    const handleView = (id: number | null) => {
        if (!id) return;
        getProfessionalDetails(id)
            .then(details => {
                ensureCSRFToken();
                setSelectedProfessional(details);
                setShowModal(true);
            })
            .catch(() => setSelectedProfessional(null));
    };

    const handleDelete = (professionalId: number) => {
        showConfirmation("Are you sure you want to delete the contact?", async () => {
            try {
                await deleteProfessionalAndContact(professionalId);
                setProfessionals((prev) => prev.filter(p => p.id !== professionalId));
                await ensureCSRFToken();
            } catch (error) {
                alert("Failed to delete the contact.");
            }
        });
    };

    const handleDowngrade = (professionalId: number) => {
        showConfirmation("Are you sure you want to downgrade as unknown this professional?", async () => {
            try {
                await deleteProfessional(professionalId);
                setProfessionals((prev) => prev.filter(p => p.id !== professionalId));
                await ensureCSRFToken();
            } catch (error) {
                alert("Failed to downgrade the professional.");
            }
        });
    };

    function filterState(state: string): string {
        switch (state) {
            case "employed":
                return "employed";
            case "available_for_work":
                return "available for work";
            case "not_available":
                return "not available";
            default:
                return state;
        }
    }

    const getStateStyle = (state: string): React.CSSProperties => {
        switch (state.toLowerCase()) {
            case "employed":
                return { backgroundColor: "#cfe2ff", color: "#052c65", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
            case "available_for_work":
                return { backgroundColor: "#d1e7dd", color: "#0f5132", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
            case "not_available":
            default:
                return { backgroundColor: "#f8d7da", color: "#842029", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
        }
    };

    const renderProfessionalCard = (prof: ProfessionalDTO) => (
        <Card key={prof.id} className="mb-3" style={{ backgroundColor: '#F6F5EC', border: '1px solid #14382C' }}>
            <Card.Body>
                <h5 className="mb-3">{prof.name} {prof.surname}</h5>
                <Row>
                    <Col md={6}>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsGeoAlt className="me-2" />
                                <strong>Location:</strong> {prof.location}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsAward className="me-2" />
                                <strong>Skills:</strong> {prof.skills.join(", ") || "None"}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                    <Col md={6}>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <strong>State:</strong>
                                <span style={getStateStyle(prof.state)}>
                                    {filterState(prof.state)}
                                </span>
                            </ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsCashStack className="me-2" />
                                <strong>Daily Rate:</strong> €{prof.dailyRate.toFixed(2)}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>
                    <div className="mt-3 d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-2">
                            {canAddEdit && <Button variant="warning"><BsPencilSquare /> Edit</Button>}
                            {canDelete && (
                                <>
                                    <Button variant="danger" onClick={() => handleDowngrade(prof.id)}>
                                        <BsPersonDown /> Downgrade as unknown
                                    </Button>
                                    <Button variant="danger" onClick={() => handleDelete(prof.id)}>
                                        <BsTrash /> Delete
                                    </Button>
                                </>
                            )}
                        </div>
                        <div>
                            <Button className="btn-custom" onClick={() => handleView(prof.id)}>
                                <BsEye /> View
                            </Button>
                        </div>
                    </div>


            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="py-4">
            <Row>
                <Col md={9}>
                    <h2 className="mb-4">Professionals</h2>
                    {canAddEdit && (
                        <div className="mb-3">
                            <Button className="btn-custom" onClick={() => setShowModal(true)} ><BsPersonWorkspace /> Upgrade unknown contact as professional</Button>
                        </div>
                    )}
                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="4">Items per page:</Form.Label>
                        <Col sm="3">
                            <Form.Select
                                value={limit}
                                onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(0); }}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </Form.Select>
                        </Col>
                    </Form.Group>

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" />
                        </div>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && professionals.length === 0 && (
                        <Alert variant="info">No professionals found.</Alert>
                    )}

                    {!loading && !error && professionals.map(renderProfessionalCard)}

                    {!loading && !error && professionals.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <Button className="btn-custom-outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Back</Button>
                            <span>Page {page + 1}</span>
                            <Button className="btn-custom" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>Next</Button>
                        </div>
                    )}
                </Col>

                <Col md={3}>
                    <div style={{ position: 'sticky', top: '80px' }}>
                        <Card>
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">Filters</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Location</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="location"
                                        value={filters.location}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>State</Form.Label>
                                    <Form.Select
                                        name="state"
                                        value={filters.state}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">All states</option>
                                        <option value="employed">Employed</option>
                                        <option value="available_for_work">Available for Work</option>
                                        <option value="not_available">Not Available</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Skills</Form.Label>
                                    <Select
                                        isMulti
                                        options={availableSkills.map(skill => ({
                                            value: skill.id!,
                                            label: skill.skill,
                                        }))}
                                        value={selectedSkills}
                                        onChange={(selected) => {
                                            setSelectedSkills(selected as { value: number; label: string }[]);
                                        }}
                                    />
                                </Form.Group>

                                <Button variant="primary" onClick={handleSearch} className="w-100">Search</Button>
                                <Button variant="danger" onClick={handleClearFilters} className="w-100 mt-2" disabled={!hasActiveFilters}>
                                    Remove Filters
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Professional Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProfessional ? (
                        <>
                            <p><strong>Name:</strong> {selectedProfessional.name}</p>
                            <p><strong>Surname:</strong> {selectedProfessional.surname}</p>
                            <p><strong>Location:</strong> {selectedProfessional.location}</p>
                            <p><strong>State:</strong> {selectedProfessional.state}</p>
                            <p><strong>Daily Rate:</strong> €{selectedProfessional.daily_rate.toFixed(2)}</p>
                            <p><strong>Category:</strong> {selectedProfessional.category}</p>
                            <p><strong>SSN Code:</strong> {selectedProfessional.ssn_code || "None"}</p>
                            <p><strong>Email(s):</strong> {selectedProfessional.emails.join(", ") || "None"}</p>
                            <p><strong>Address(es):</strong> {selectedProfessional.addresses.join(", ") || "None"}</p>
                            <p><strong>Phone Number(s):</strong> {selectedProfessional.phone_numbers.join(", ") || "None"}</p>
                            <p><strong>Skill(s):</strong> {selectedProfessional.skills.join(", ") || "None"}</p>
                        </>
                    ) : (
                        <p>Loading details...</p>
                    )}
                </Modal.Body>
            </Modal>
            <Modal show={confirmModalVisible} onHide={() => setConfirmModalVisible(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Action</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{confirmMessage}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmModalVisible(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={() => {
                        setConfirmModalVisible(false);
                        confirmAction();
                    }}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ListProfessionals;
