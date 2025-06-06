import { useEffect, useState } from "react";
import { MessageDTO } from "../../objects/Message.ts";
import {
    Container, Row, Col, Card, Spinner, Alert, Button, Form
} from 'react-bootstrap';
import {listMessages} from "../../apis/apiMessage.tsx";

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

    useEffect(() => {
        setLoading(true);
        setError(null);

        listMessages(page, limit, stateFilter, sortField, sortDirection)
            .then(data => {
                setMessages(data);
                setHasMore(data.length === limit);
            })
            .catch(err => {
                setError(err.message || "Errore durante il caricamento dei messaggi");
                setMessages([]);
            })
            .finally(() => setLoading(false));
    }, [page, limit, stateFilter, sortField, sortDirection]);

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSortField(value);
        setPage(0);
    };

    const handleDirectionChange = () => {
        setSortDirection(prev => -prev);
    };

    const renderMessageCard = (msg: MessageDTO) => (
        <Card key={msg.id} className="mb-3" style={{ backgroundColor: "#F0F0F0" }}>
            <Card.Body>
                <h5>{msg.subject}</h5>
                <p><strong>From:</strong> {msg.sender}</p>
                <p><strong>Channel:</strong> {msg.channel}</p>
                <p><strong>Priority:</strong> {msg.priority}</p>
                <p><strong>Status:</strong> {msg.currentState}</p>
                <p><strong>Date:</strong> {msg.createdDate || "N/A"}</p>
                <p><strong>Body:</strong> {msg.body}</p>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="py-4">
            <Row>
                <Col md={9}>
                    <h2 className="mb-4">Messages</h2>

                    <Form.Group as={Row} className="mb-3">
                        <Form.Label column sm="4">Items per page:</Form.Label>
                        <Col sm="3">
                            <Form.Select value={limit} onChange={e => { setLimit(parseInt(e.target.value)); setPage(0); }}>
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

                    {!loading && !error && messages.length === 0 && (
                        <Alert variant="info">No messages found.</Alert>
                    )}

                    {!loading && !error && messages.map(renderMessageCard)}

                    {!loading && !error && messages.length > 0 && (
                        <div className="d-flex justify-content-between align-items-center mt-4">
                            <Button variant="outline-primary" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
                                Indietro
                            </Button>
                            <span>Page {page + 1}</span>
                            <Button variant="primary" onClick={() => setPage(p => p + 1)} disabled={!hasMore}>
                                Avanti
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
                                    <Form.Label>Status</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={stateFilter}
                                        onChange={(e) => { setStateFilter(e.target.value); setPage(0); }}
                                        placeholder="E.g. SENT, RECEIVED"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sort by</Form.Label>
                                    <Form.Select value={sortField} onChange={handleSortChange}>
                                        <option value="createdDate">Created Date</option>
                                        <option value="priority">Priority</option>
                                        <option value="sender">Sender</option>
                                    </Form.Select>
                                </Form.Group>
                                <Button variant="secondary" className="w-100" onClick={handleDirectionChange}>
                                    Sort Direction: {sortDirection === 1 ? "Asc" : "Desc"}
                                </Button>
                            </Card.Body>
                        </Card>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default ListMessages;
