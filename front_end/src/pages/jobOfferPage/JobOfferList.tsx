import React, { useEffect, useState } from "react";
import {
    listJobOffers,
    createJobOffer
} from "../../apis/apiJobOffer.tsx";
import { listCustomers } from "../../apis/apiCustomer.tsx";
import {createSkill, listAllSkills} from "../../apis/apiSkill.tsx";
import { ensureCSRFToken } from "../../apis/apiUtils.tsx";
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { BsClock, BsCash, BsListCheck, BsFileText } from 'react-icons/bs';
import './JobOfferList.css';
import Select, {MultiValue} from 'react-select';
import { CreateJobOffer, JobOffer } from "../../objects/JobOffer.ts";
import { CustomerDTO } from "../../objects/Customer.ts";
import { SkillDTO } from "../../objects/Skill.ts";
import JobOfferPage from "./JobOfferPage.tsx";
import {listProfessionals} from "../../apis/apiProfessional.tsx";
import {ProfessionalDTO} from "../../objects/Professional.ts";


export default function ListJobOffers() {
    const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [selectedJobOffer, setSelectedJobOffer] = useState< JobOffer | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState<CreateJobOffer>({
        description: "",
        notes: "",
        duration: 1,
        skills: []
    });

    const [filters, setFilters] = useState({
        state: "",
        customer: 0,
        professional: 0,
    });
    const [filtering, setFiltering] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const hasActiveFilters = Object.values(appliedFilters).some(val => val !== "" && val !== 0);
    const [customerSelected, setCustomerSelected] = useState<CustomerDTO | null>(null);
    const [professionalSelected, setProfessionalSelected] = useState<ProfessionalDTO | null>(null);
    const [filterCustomers, setFilterCustomers] = useState<CustomerDTO[]>([]);
    const [filterProfessionals, setFilterProfessionals] = useState<ProfessionalDTO[]>([]);
    const [keywordCustomerFilter, setKeywordCustomerFilter] = useState<string>("");
    const [keywordProfessionalFilter, setKeywordProfessionalFilter] = useState<string>("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);

    const [availableSkills, setAvailableSkills] = useState<SkillDTO[]>([]);
    const [newSkillName, setNewSkillName] = useState("");

    const [limit, setLimit] = useState(20);
    const getCategoryStyle = (category: string): React.CSSProperties => {
        switch (category.toLowerCase()) {
            case "created":
                return { backgroundColor: "#cff4fc", color: "#055160", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // azzurrino
            case "selection phase":
                return { backgroundColor: "#fff3cd", color: "#664d03", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // giallo tenue
            case "candidate proposal":
                return { backgroundColor: "#e2e3e5", color: "#41464b", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // grigio neutro
            case "consolidated":
                return { backgroundColor: "#e7e0f8", color: "#3d2c6d", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // lilla tenue
            case "done":
                return { backgroundColor: "#d1e7dd", color: "#0f5132", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // verde
            case "aborted":
                return { backgroundColor: "#f8d7da", color: "#842029", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // rosso
            default:
                return { backgroundColor: "#f8d7da", color: "#842029", borderRadius: "10px", padding: "2px 8px", display: "inline-block" }; // fallback grigio chiaro
        }
    };

    useEffect(() => {
        loadOffers();
        handleCustomerSearch()
        handleProfessionalSearch()
    }, [page, limit,selectedJobOffer]);

    useEffect(() => {
        if (showModal) {
            setLoadingCustomers(true);
            listCustomers({ page: 0, limit: 100 })
                .then(data => setCustomers(data))
                .catch(() => setCustomers([]))
                .finally(() => setLoadingCustomers(false));

            const fetchSkills = async () => {
                try {
                    const skills = await listAllSkills();
                    setAvailableSkills(skills);
                    await ensureCSRFToken();
                } catch (error) {
                    console.error("Error in loading skills:", error);
                }
            };
            fetchSkills();
        }
    }, [showModal]);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const handleCustomerSearch = async () => {
        setFiltering(true);
        try {
            setCustomerSelected(null);
            await ensureCSRFToken();
            const resultsCustomers = await listCustomers({
                page: 0,
                limit: 10000,
                keyword: keywordCustomerFilter,
            });

            setFilterCustomers(resultsCustomers);
            await ensureCSRFToken();
        } catch (error) {
            alert("Error fetching contacts. The server is probably just shy.");
            console.error(error);
        } finally {
            setFiltering(false);
        }
    };
    const handleProfessionalSearch = async () => {
        setFiltering(true);
        try {

            setProfessionalSelected(null);

            await ensureCSRFToken();
            const resultsProfessionals = await listProfessionals({
                page: 0,
                limit: 10000,
                keyword: keywordProfessionalFilter,
                }
            );
            setFilterProfessionals(resultsProfessionals);
            await ensureCSRFToken();
        } catch (error) {
            alert("Error fetching contacts. The server is probably just shy.");
            console.error(error);
        } finally {
            setFiltering(false);
        }
    };
    const handleSearch = async () => {
        setLoading(true);
        setError(null);
        setAppliedFilters(filters);

        listJobOffers(page, limit, filters.state,filters.customer, filters.professional)
            .then((data) => {
                setJobOffers(data);
                setHasMore(data.length >= limit);
                ensureCSRFToken();
            })
            .catch((err: any) => {
                setError(err.message || "Error while loading job offers");
                setJobOffers([]);
                setHasMore(false);
            })
            .finally(() => setLoading(false));
    };


    const handleClearFilters = () => {
        setFilters({state: "", customer: 0, professional: 0});
        setAppliedFilters({state: "", customer: 0, professional: 0});
        setCustomerSelected(null);
        setProfessionalSelected(null);
        loadOffers();
    };

    const handleCardClick = (job: JobOffer) => {
        setSelectedJobOffer(job);
    };

    const loadOffers = () => {
        setLoading(true);
        setError(null);


        listJobOffers(page, limit)
            .then((data) => {
                setJobOffers(data);
                setHasMore(data.length >= limit);
                ensureCSRFToken();
            })
            .catch((err: any) => {
                setError(err.message || "Error while loading job offers");
                setJobOffers([]);
                setHasMore(false);
            })
            .finally(() => setLoading(false));
    };

    const handleAddJobOffer = () => {
        if (selectedCustomerId === null) return;
        createJobOffer(formData, selectedCustomerId)
            .then(() => {
                setShowModal(false);
                setFormData({ description: "", notes: "", duration: 1, skills: [] });
                setSelectedCustomerId(null);
                setNewSkillName("");
                loadOffers();
            })
            .catch(err => setError(err.message || "Error during job offer creation"));
    };

    const handleSkillsChange = (
        selectedOptions: MultiValue<{ value: number; label: string }>
    ) => {
        const selectedIds = selectedOptions.map(option => option.value);
        setFormData({ ...formData, skills: selectedIds });
    };

    const isFormValid = formData.description.trim() !== "" &&
        formData.notes?.trim() !== "" &&
        formData.duration > 0 &&
        selectedCustomerId !== 0;



    const renderJobOfferCard = (job: JobOffer) => {
        const customer = filterCustomers.find(it => it.id === job.customer);

        return (
            <Card
                key={job.id}
                className="mb-3 job-offer-card"
                style={{ backgroundColor: '#F6F5EC', border: '1px solid #14382C' }}
                onClick={() => handleCardClick(job)}
            >
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                        <h3 className="h5 mb-0">
                            {job.description} - {customer ? `${customer.name} ${customer.surname}` : "Unknown Customer"}
                        </h3>
                        <span style={getCategoryStyle(job.state)}>
                        {job.state.toLowerCase().includes("aborted") ? "Aborted" : job.state}
                    </span>
                    </div>
                    <Row className="mt-3">
                        <Col md={6}>
                            <div className="d-flex align-items-center mb-2">
                                <BsClock className="me-2" /><span><b>Duration:</b> {job.duration} days</span>
                            </div>
                            <div className="d-flex align-items-center mb-2">
                                <BsCash className="me-2" />
                                <span><b>Value:</b> €{job.value?.toFixed(2)}</span>
                            </div>
                        </Col>
                        <Col md={6}>
                            <div className="d-flex align-items-center mb-2">
                                <BsListCheck className="me-2" />
                                <span><b> Skills: </b>{job.skills.map(it => it.skill).join(", ") || "None"}</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <BsFileText className="me-2" />
                                <span><b> Notes: </b>{job.notes || "No Notes"}</span>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>
        );
    };

    if (selectedJobOffer) {
        return (
            <Container className="py-4">
                <JobOfferPage jobOffer={selectedJobOffer} onBack={() => setSelectedJobOffer(null)} />
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row>
                <Col md={9}>
                    <div className="mb-4">
                        <h2>Job offers</h2>
                        <Button className="btn-custom mt-2" onClick={() => setShowModal(true)} >Add new offer</Button>
                    </div>
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
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && jobOffers.length === 0 && (
                        <Alert variant="info">No offers found.</Alert>
                    )}

                    {!loading && !error && jobOffers.map(renderJobOfferCard)}

                    {!loading && !error && jobOffers.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <Button
                                className="btn-custom-outline"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Back
                            </Button>
                            <span>Page {page + 1}</span>
                            <Button
                                className="btn-custom"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={!hasMore}
                            >
                                Next
                            </Button>
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
                                    <Form.Label>State</Form.Label>
                                    <Form.Select
                                        name="state"
                                        value={filters.state}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">All states</option>
                                        <option value="created">Created</option>
                                        <option value="selection phase">Selection Phase</option>
                                        <option value="candidate selection">Candidate Selection</option>
                                        <option value="consolidated">Consolidated</option>
                                        <option value="done">Done</option>
                                        <option value="aborted">Aborted</option>

                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Customer</Form.Label>
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            placeholder="Keyword"
                                            value={keywordCustomerFilter}
                                            onChange={(e) => setKeywordCustomerFilter(e.target.value)}
                                            className="me-2"
                                        />
                                        <Button
                                            className="btn-custom"
                                            onClick={handleCustomerSearch}
                                        >
                                            {filtering ? <Spinner animation="border" size="sm" /> : "Apply"}
                                        </Button>
                                    </div>
                                    <Form.Select
                                        value={customerSelected?.id ?? ""}
                                        onChange={(e) => {
                                            const selected = filterCustomers.find(c => c.id === parseInt(e.target.value));
                                            setCustomerSelected(selected ?? null);
                                            setFilters(prev => ({ ...prev, customer: selected?.id ?? 0 }));
                                        }}
                                    >
                                        <option value="">-- Choose a customer --</option>
                                        {filterCustomers.map(customer => (
                                            <option key={customer.id} value={customer.id}>
                                                {customer.name} {customer.surname}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Professional</Form.Label>
                                    <div className="d-flex align-items-center mb-2">
                                        <Form.Control
                                            placeholder="Keyword"
                                            value={keywordProfessionalFilter}
                                            onChange={(e) => setKeywordProfessionalFilter(e.target.value)}
                                            className="me-2"
                                        />
                                        <Button
                                            className="btn-custom"
                                            onClick={handleProfessionalSearch}

                                        >
                                            {filtering ? <Spinner animation="border" size="sm" /> : "Apply"}
                                        </Button>
                                    </div>
                                    <Form.Select
                                        value={professionalSelected?.id ?? ""}
                                        onChange={(e) => {
                                            const selected = filterProfessionals.find(c => c.id === parseInt(e.target.value));
                                            setProfessionalSelected(selected ?? null);
                                            setFilters(prev => ({ ...prev, professional: selected?.id ?? 0 }));
                                        }}
                                    >
                                        <option value="">-- Choose a professional--</option>
                                        {filterProfessionals.map(professional => (
                                            <option key={professional.id} value={professional.id}>
                                                {professional.name} {professional.surname}
                                            </option>
                                        ))}
                                    </Form.Select>
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

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Create Job Offer</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="description" className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="notes" className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group controlId="duration" className="mb-3">
                            <Form.Label>Duration (days)</Form.Label>
                            <Form.Control
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                min={1}
                            />
                        </Form.Group>
                        <Form.Group controlId="customer" className="mb-3">
                            <Form.Label>Customer</Form.Label>
                            <Form.Select
                                value={selectedCustomerId ?? ""}
                                onChange={(e) => setSelectedCustomerId(parseInt(e.target.value))}
                                disabled={loadingCustomers || customers.length === 0}
                            >
                                <option value={0}>Select a customer</option>
                                {customers.map((cust) => (
                                    <option key={cust.id} value={cust.id}>
                                        {cust.name} {cust.surname}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Skills</Form.Label>
                                    <Select
                                        isMulti
                                        options={availableSkills.map(skill => ({
                                            value: skill.id!,
                                            label: skill.skill,
                                        }))}
                                        value={availableSkills
                                            .filter(skill => formData.skills.includes(skill.id!))
                                            .map(skill => ({
                                                value: skill.id!,
                                                label: skill.skill,
                                            }))}
                                        onChange={handleSkillsChange}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>New skill</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={newSkillName}
                                        onChange={(e) => setNewSkillName(e.target.value)}
                                        placeholder="Insert a new skill"
                                    />
                                    <Button
                                        className="mt-2 btn-custom"
                                        onClick={async () => {
                                            if (!newSkillName.trim()) return;
                                            try {
                                                const newSkill = await createSkill(newSkillName.trim());
                                                setAvailableSkills((prev) => [...prev, newSkill]);
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    skills: [...prev.skills, newSkill.id!],
                                                }));
                                                setNewSkillName("");
                                                await ensureCSRFToken();
                                            } catch (error) {
                                                console.error("Error during skill creation:", error);
                                            }
                                        }}
                                    >
                                        Add skill
                                    </Button>
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
                    <Button className="btn-custom" onClick={handleAddJobOffer} disabled={!isFormValid}>Create</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
