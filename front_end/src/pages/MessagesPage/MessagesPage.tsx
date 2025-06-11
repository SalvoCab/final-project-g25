import React, { useEffect, useState } from "react";
import {
    Container, Button, Spinner, Alert, Form, Table, Row, Col, Modal
} from "react-bootstrap";
import { changeMessageState, listMessages } from "../../apis/apiMessage";
import { MessageDTO } from "../../objects/Message";
import { ensureCSRFToken } from "../../apis/apiUtils";

const ListMessages: React.FC = () => {
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(20);
    const [stateFilter, setStateFilter] = useState("");
    const [sortField, setSortField] = useState("createdDate");
    const [sortDirection, setSortDirection] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageDTO | null>(null);
    const [showActionModal, setShowActionModal] = useState(false);
    const [actionState, setActionState] = useState<string>("");
    const [comment, setComment] = useState<string>("");

    useEffect(() => {
        fetchData();
    }, [page, limit, stateFilter, sortField, sortDirection]);

    const fetchData = () => {
        setLoading(true);
        setError(null);
        listMessages(page, limit, stateFilter, sortField, sortDirection)
            .then(data => {
                setMessages(data);
                setHasMore(data.length === limit);
                ensureCSRFToken();
            })
            .catch(err => {
                setError(err.message || "Error while loading messages");
                setMessages([]);
            })
            .finally(() => setLoading(false));
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortField(e.target.value);
        setPage(0);
    };

    const handleDirectionChange = () => {
        setSortDirection(prev => -prev);
    };

    const handleRowDoubleClick = async (msg: MessageDTO) => {
        if (!msg.id) return;
        if (msg.currentState.toLowerCase() === "received") {
            setLoading(true);
            try {
                await changeMessageState(msg.id, { state: "Read", comment: "Message read" }).then((mess) => {
                    setMessages(prev => prev.map(m => m.id === mess.id_message ? { ...m, currentState: mess.state } : m));
                    setSelectedMessage({ ...msg, currentState: mess.state });
                });
                await ensureCSRFToken();
            } catch (error) {
                console.error("Unexpected error:", error);
                setError("Error while updating the message.");
            } finally {
                setLoading(false);
            }
        } else {
            setSelectedMessage(msg);
        }
    };

    const formatDate = (isoDate: string | null) => {
        if (!isoDate) return "";
        const date = new Date(isoDate);
        return date.toLocaleString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    const getRowStyle = (state: string) => {
        switch (state.toLowerCase()) {
            case "received": return { fontWeight: "bold" };
            case "discarded": return { color: "gray" };
            case "failed": return { textDecoration: "underline", color: "gray"};
            case "processing": return { color: "darkblue", background:"aliceblue" };
            case "done": return { background:"#e6f9e6" };
            default: return {};
        }
    };

    const getNextPossibleActions = (state: string): string[] => {
        switch (state.toLowerCase()) {
            case "read":
                return ["Processing", "Done", "Discarded", "Failed"];
            case "processing":
                return ["Done", "Failed"];
            default:
                return [];
        }
    };

    const openActionModal = (state: string) => {
        setActionState(state);
        setComment("");
        setShowActionModal(true);
    };

    const handleChangeState = async () => {
        if (selectedMessage?.id == null) return;
        setLoading(true);
        try {
            await changeMessageState(selectedMessage.id, { state: actionState, comment }).then((mess) => {
                setMessages(prev => prev.map(m => m.id === mess.id_message ? { ...m, currentState: mess.state } : m));
                setSelectedMessage({ ...selectedMessage, currentState: mess.state });
            });
            await ensureCSRFToken();
        } catch (error) {
            console.error("Unexpected error:", error);
            setError("Error while updating the message.");
        } finally {
            setLoading(false);
            setShowActionModal(false);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Messages</h2>
            {/* Paginazione limit */}
            <Form.Group as={Row} className="mb-3">
                <Form.Label column sm="2">Items per page:</Form.Label>
                <Col sm="2">
                    <Form.Select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(0); }}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </Form.Select>
                </Col>
            </Form.Group>

            <Row className="align-items-end mb-3">
                <Col sm="4">
                    <Form.Group>
                        <Form.Label>Filter by status:</Form.Label>
                        <Form.Select value={stateFilter} onChange={(e) => { setStateFilter(e.target.value); setPage(0); }}>
                            <option value="">All states</option>
                            <option value="received">Received</option>
                            <option value="read">Read</option>
                            <option value="discarded">Discarded</option>
                            <option value="done">Done</option>
                            <option value="processing">Processing</option>
                            <option value="failed">Failed</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col sm="4">
                    <Form.Group>
                        <Form.Label>Sort by:</Form.Label>
                        <Form.Select value={sortField} onChange={handleSortChange}>
                            <option value="createdDate">Created Date</option>
                            <option value="priority">Priority</option>
                            <option value="sender">Sender</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col sm="2">
                    <Form.Group>
                        <Form.Label>Sort direction:</Form.Label><br />
                        <Button variant="secondary" onClick={handleDirectionChange}>
                            {sortDirection === 1 ? "Descendent" : "Ascendant"}
                        </Button>
                    </Form.Group>
                </Col>
            </Row>

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && messages.length === 0 && (
                <Alert variant="info">No messages found.</Alert>
            )}

            {!loading && !error && messages.length > 0 && (
                <>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Subject</th>
                            <th>From</th>
                            <th>Channel</th>
                            <th>Priority</th>
                            <th>Date, Time</th>
                            <th>State</th>
                        </tr>
                        </thead>
                        <tbody>
                        {messages.map(msg => (
                            <tr key={msg.id} onDoubleClick={() => handleRowDoubleClick(msg)} style={{ cursor: "pointer", ...getRowStyle(msg.currentState) }}>
                                <td style={getRowStyle(msg.currentState)}>{msg.subject}</td>
                                <td style={getRowStyle(msg.currentState)}>{msg.sender}</td>
                                <td style={getRowStyle(msg.currentState)}>{msg.channel}</td>
                                <td style={getRowStyle(msg.currentState)}>{msg.priority}</td>
                                <td style={getRowStyle(msg.currentState)}>{formatDate(msg.createdDate)}</td>
                                <td style={getRowStyle(msg.currentState)}>{msg.currentState}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <Button className="btn-custom-outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                            Back
                        </Button>
                        <span>Page {page + 1}</span>
                        <Button className="btn-custom" onClick={() => setPage(p => p + 1)} disabled={!hasMore}>
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* Message Details Modal */}
            <Modal show={!!selectedMessage} onHide={() => setSelectedMessage(null)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Message details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMessage && (
                        <>
                            <p><strong>Subject:</strong> {selectedMessage.subject}</p>
                            <p><strong>From:</strong> {selectedMessage.sender}</p>
                            <p><strong>Channel:</strong> {selectedMessage.channel}</p>
                            <p><strong>Priority:</strong> {selectedMessage.priority}</p>
                            <p><strong>Status:</strong> {selectedMessage.currentState}</p>
                            <p><strong>Date, Time:</strong> {formatDate(selectedMessage.createdDate)}</p>
                            <p><strong>Body:</strong> {selectedMessage.body}</p>


                            {getNextPossibleActions(selectedMessage.currentState).length > 0 &&
                                <>
                                    {/* Action buttons */}
                                    <hr />
                                    <p><strong>Possible Actions:</strong></p>
                                    {getNextPossibleActions(selectedMessage.currentState).map(action => (
                                        <Button key={action} variant="primary" className="m-1" onClick={() => openActionModal(action)}>
                                            {action}
                                        </Button>
                                    ))}
                                </>}
                        </>
                    )}
                </Modal.Body>
            </Modal>

            {/* Comment Modal */}
            <Modal show={showActionModal} onHide={() => setShowActionModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Change state to {actionState}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group>
                        <Form.Label>Comment:</Form.Label>
                        <Form.Control as="textarea" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowActionModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleChangeState}>Confirm</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ListMessages;
