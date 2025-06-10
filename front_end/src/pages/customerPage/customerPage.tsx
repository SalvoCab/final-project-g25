import { useEffect, useState } from "react";
import {Container, Row, Col, Card, Button, Spinner, Alert, ListGroup, Modal, Form} from 'react-bootstrap';
import {BsBuildingAdd, BsEye, BsPencilSquare, BsPersonDown, BsTrash} from "react-icons/bs";
import {listCustomers, getCustomerDetails, deleteCustomerAndContact, deleteCustomer} from "../../apis/apiCustomer";
import { CustomerDTO, CustomerDetails } from "../../objects/Customer";
import { MeInterface } from "../../App";
import {ensureCSRFToken} from "../../apis/apiUtils.tsx";
import EditCustomerModal from "./editCustomerModal.tsx";
import AddCustomerModal from "./addCustomerModal.tsx";

interface ListCustomersProps {
    me: MeInterface | null;
}

const ListCustomers: React.FC<ListCustomersProps> = ({ me }) => {
    const [customers, setCustomers] = useState<CustomerDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [customerToEdit, setCustomerToEdit] = useState<CustomerDTO | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const role = me?.role ?? "";
    const permissions = {
        canView: ["manager", "operator", "guest"],
        canAddEdit: ["manager", "operator"],
        canDelete: ["manager"]
    };

    const canAddEdit = permissions.canAddEdit.includes(role);
    const canDelete = permissions.canDelete.includes(role);

    const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetails | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
    const [confirmMessage, setConfirmMessage] = useState("");
    const showConfirmation = (message: string, onConfirm: () => void) => {
        setConfirmMessage(message);
        setConfirmAction(() => onConfirm);
        setConfirmModalVisible(true);
    };

    useEffect(() => {
        setLoading(true);
        setError(null);
        listCustomers({ page, limit })
            .then(data => {
                setCustomers(data);
                setHasMore(data.length === limit);
                ensureCSRFToken();
            })
            .catch(err => {
                setError(err.message || "Errore durante il caricamento dei clienti");
                setCustomers([]);
            })
            .finally(() => setLoading(false));
    }, [page, limit]);

    const handleView = (id: number | null) => {
        if (!id) return;
        getCustomerDetails(id)
            .then(details => {
                setSelectedCustomer(details);
                setShowModal(true);
                ensureCSRFToken();
            })
            .catch(() => setSelectedCustomer(null));
    };

    const handleDelete = (customerId: number) => {
        showConfirmation("Are you sure you want to delete the contact?", async () => {
            try {
                await deleteCustomerAndContact(customerId);
                setCustomers((prev) => prev.filter(c => c.id !== customerId));
                await ensureCSRFToken();
            } catch (error) {
                alert("Failed to delete the contact.");
            }
        });
    };

    const handleDowngrade = (customerId: number) => {
        showConfirmation("Are you sure you want to downgrade as unknown this customer?", async () => {
            try {
                await deleteCustomer(customerId);
                setCustomers((prev) => prev.filter(c => c.id !== customerId));
                await ensureCSRFToken();
            } catch (error) {
                alert("Failed to downgrade the customer.");
            }
        });
    };

    const reloadCustomer = () => {
        setPage(0);
        setLoading(true);
        setError(null);
        listCustomers({page, limit })
            .then((data) => {
                setCustomers(data);
                setHasMore(data.length === limit);
                ensureCSRFToken();
            })
            .catch((err: any) => {
                setError(err.message || "Errore durante il caricamento dei contatti");
                setCustomers([]);
            })
            .finally(() => setLoading(false));
    }

    const renderCustomerCard = (customer: CustomerDTO) => (
        <Card key={customer.id} className="mb-3" style={{ backgroundColor: '#F6F5EC', border: '1px solid #14382C' }}>
            <Card.Body>
                <h5 className="mb-3">{customer.name} {customer.surname}</h5>
                <ListGroup variant="flush">
                    <ListGroup.Item style={{ backgroundColor: '#F6F5EC' }}>
                        <strong>Notes:</strong> {customer.notes || "None"}
                    </ListGroup.Item>
                </ListGroup>
                <div className="mt-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                        {canAddEdit && <Button variant="warning" onClick={() => {setCustomerToEdit(customer);setShowEditModal(true)}}><BsPencilSquare /> Edit notes</Button>}
                        {canDelete && (
                            <>
                                <Button variant="danger" onClick={() => handleDowngrade(customer.id)}>
                                    <BsPersonDown /> Downgrade as unknown
                                </Button>
                                <Button variant="danger" onClick={() => handleDelete(customer.id)}>
                                    <BsTrash /> Delete
                                </Button>
                            </>
                        )}
                    </div>
                    <div>
                        <Button className="btn-custom" onClick={() => handleView(customer.id)}>
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
                <Col md={12}>
                    <h2 className="mb-4">Customers</h2>

                    {canAddEdit && (
                        <div className="mb-3">
                            <Button className="btn-custom" onClick={() => setShowAddModal(true)} ><BsBuildingAdd /> Upgrade unknown contact as customer</Button>
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

                    {!loading && !error && customers.length === 0 && (
                        <Alert variant="info">No customers found.</Alert>
                    )}

                    {!loading && !error && customers.map(renderCustomerCard)}

                    {!loading && !error && customers.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <Button className="btn-custom-outline" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>Back</Button>
                            <span>Page {page + 1}</span>
                            <Button className="btn-custom" onClick={() => setPage((p) => p + 1)} disabled={!hasMore}>Next</Button>
                        </div>
                    )}
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Customer Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedCustomer ? (
                        <>
                            <p><strong>Name:</strong> {selectedCustomer.name}</p>
                            <p><strong>Surname:</strong> {selectedCustomer.surname}</p>
                            <p><strong>Notes:</strong> {selectedCustomer.notes || "No notes for this customer"}</p>
                            <p><strong>Category:</strong> {selectedCustomer.category}</p>
                            <p><strong>SSN Code:</strong> {selectedCustomer.ssn_code || "None"}</p>
                            <p><strong>Email(s):</strong> {selectedCustomer.emails.join(", ") || "None"}</p>
                            <p><strong>Address(es):</strong> {selectedCustomer.addresses.join(", ") || "None"}</p>
                            <p><strong>Phone Number(s):</strong> {selectedCustomer.phone_numbers.join(", ") || "None"}</p>
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
            <EditCustomerModal
                customer={customerToEdit}
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                onCustomerEdited={reloadCustomer}
            />
            <AddCustomerModal
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onCustomerAdded={reloadCustomer}
            />

        </Container>
    );
};

export default ListCustomers;
