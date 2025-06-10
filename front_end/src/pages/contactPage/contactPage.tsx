import { useEffect, useState } from "react";
import "./contactPage.css";
import {deleteContact, listContacts} from "../../apis/apiContact.tsx";
import { ContactDTO } from "../../objects/Contact.ts";
import {
    Container, Row, Col, Card, Button, Spinner, Alert,
    Form, ListGroup, Modal
} from 'react-bootstrap';
import {
    BsEnvelope, BsGeoAlt, BsPencilSquare, BsPersonAdd, BsPersonBadge,
    BsPersonVcard, BsTelephone, BsTrash
} from "react-icons/bs";
import { MeInterface } from '../../App.tsx';
import AddContactModal from "./addContactModal.tsx"
import EditContactModal from "./editContactModal.tsx";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";


interface ListContactsProps {
    me: MeInterface | null;
}

const ListContacts: React.FC<ListContactsProps> = ({ me }) => {
    const [contacts, setContacts] = useState<ContactDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [filters, setFilters] = useState({
        email: "",
        address: "",
        number: "",
        keyword: ""
    });
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [contactToDelete, setContactToDelete] = useState<number | null>(null);
    const [appliedFilters, setAppliedFilters] = useState(filters);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [contactToEdit, setContactToEdit] = useState<ContactDTO | null>(null);

    const role = me?.role ?? "";
    const permissions = {
        canView: ["manager", "operator", "guest"],
        canAddEdit: ["manager", "operator"],
        canDelete: ["manager"]
    };

    const canAddEdit = permissions.canAddEdit.includes(role);
    const canDelete = permissions.canDelete.includes(role);
    const hasActiveFilters = Object.values(appliedFilters).some(val => val !== "");
    const handleDeleteClick = (contactId: number) => {
        setContactToDelete(contactId);
        setConfirmDeleteVisible(true);
    };

    useEffect(() => {
        setLoading(true);
        setError(null);

        listContacts({ ...appliedFilters, page, limit })
            .then((data) => {
                setContacts(data);
                setHasMore(data.length === limit);
                ensureCSRFToken();
            })
            .catch((err: any) => {
                setError(err.message || "Errore durante il caricamento dei contatti");
                setContacts([]);
            })
            .finally(() => setLoading(false));
    }, [page, limit, appliedFilters]);

    const handleInputChange = (e: React.ChangeEvent<any>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = () => {
        setPage(0);
        setAppliedFilters(filters);
    };

    const reloadContacts = () => {
        setPage(0);
        setLoading(true);
        setError(null);
        listContacts({ ...appliedFilters, page, limit })
            .then((data) => {
                setContacts(data);
                setHasMore(data.length === limit);
                ensureCSRFToken();
            })
            .catch((err: any) => {
                setError(err.message || "Errore durante il caricamento dei contatti");
                setContacts([]);
            })
            .finally(() => setLoading(false));
    }

    const handleClearFilters = () => {
        const empty = { email: "", address: "", number: "", keyword: "" };
        setFilters(empty);
        setAppliedFilters(empty);
        setPage(0);
    };

    const confirmDelete = async () => {
        if (contactToDelete == null) return;
        try {
            await deleteContact(contactToDelete);
            setContacts(prev => prev.filter(c => c.id !== contactToDelete));
            await ensureCSRFToken();
        } catch (error) {
            alert("Failed to delete the contact.");
        } finally {
            setConfirmDeleteVisible(false);
            setContactToDelete(null);
        }
    };

    const getCategoryStyle = (category: string): React.CSSProperties => {
        switch (category.toLowerCase()) {
            case "professional":
                return { backgroundColor: "#d1e7dd", color: "#0f5132", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
            case "customer":
                return { backgroundColor: "#cfd5fc", color: "#052560", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
            case "unknown":
            default:
                return { backgroundColor: "#f8d7da", color: "#842029", borderRadius: "10px", padding: "2px 8px", display: "inline-block" };
        }
    };

    const renderContactCard = (contact: ContactDTO) => (
        <Card
            key={contact.id}
            className="mb-3 contact-card"
            style={{ backgroundColor: '#F6F5EC', border: '1px solid #14382C' }}
        >
            <Card.Body>
                <h5 className="mb-3">
                    {contact.name} {contact.surname}
                </h5>

                <Row>
                    <Col md={6}>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsPersonBadge className="me-2" />
                                <strong>Category:</strong>{' '}
                                <span style={getCategoryStyle(contact.category)}>{contact.category}</span>
                            </ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsPersonVcard className="me-2" />
                                <strong>SSN Code:</strong> {contact.ssnCode || "None"}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>

                    <Col md={6}>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsEnvelope className="me-2" />
                                <strong>Email:</strong> {contact.emails.join(", ") || "None"}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsGeoAlt className="me-2" />
                                <strong>Address:</strong> {contact.addresses.join(", ") || "None"}
                            </ListGroup.Item>
                            <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                                <BsTelephone className="me-2" />
                                <strong>Phone number:</strong> {contact.phoneNumber.join(", ") || "None"}
                            </ListGroup.Item>
                        </ListGroup>
                    </Col>
                </Row>

                {/* Azioni visibili in base al ruolo */}
                {(canAddEdit || canDelete) && (
                    <div className="mt-3 d-flex gap-2">
                        {canAddEdit && <Button variant="warning" onClick={() => {setContactToEdit(contact);setShowEditModal(true)}}><BsPencilSquare /> Edit</Button>}
                        {canDelete && (
                            <Button variant="danger" onClick={() => handleDeleteClick(contact.id)}>
                                <BsTrash /> Delete
                            </Button>
                        )}
                    </div>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="py-4">
            <Row>
                {/* Lista Contatti */}
                <Col md={9}>
                    <h2 className="mb-4">Contacts</h2>

                    {canAddEdit && (
                        <div className="mb-3">
                            <Button className="btn-custom" onClick={() => setShowModal(true)} ><BsPersonAdd /> Add Contact</Button>
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
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    )}

                    {error && <Alert variant="danger">{error}</Alert>}

                    {!loading && !error && contacts.length === 0 && (
                        <Alert variant="info">No contacts found.</Alert>
                    )}

                    {!loading && !error && contacts.map(renderContactCard)}

                    {!loading && !error && contacts.length > 0 && (
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

                {/* Sidebar Filtri */}
                <Col md={3}>
                    <div style={{ position: 'sticky', top: '80px' }}>
                        <Card>
                            <Card.Header className="bg-white">
                                <h5 className="mb-0">Filters</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="email"
                                        value={filters.email}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone number</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="number"
                                        value={filters.number}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={filters.address}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Keyword</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="keyword"
                                        value={filters.keyword}
                                        onChange={handleInputChange}
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
            <AddContactModal
                show={showModal}
                onHide={() => setShowModal(false)}
                onContactCreated={reloadContacts}
            />
            <EditContactModal
                contact={contactToEdit}
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                onContactEdited={reloadContacts}
            />
            <Modal show={confirmDeleteVisible} onHide={() => setConfirmDeleteVisible(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the contact?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setConfirmDeleteVisible(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export default ListContacts;
