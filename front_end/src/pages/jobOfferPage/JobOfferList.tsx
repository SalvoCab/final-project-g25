import { useEffect, useState } from "react";
import { JobOffer } from "../../objects/JobOffer.ts";
import { listJobOffers, listOpenJobOffers, listAcceptedJobOffers, listAbortedJobOffers } from "../../apis/apiJobOffer.tsx";
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { BsClock, BsCash, BsListCheck, BsFileText } from 'react-icons/bs';
import './JobOfferList.css';

type FilterType = "all" | "open" | "accepted" | "aborted";

export default function ListJobOffers() {
    const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [filter, setFilter] = useState<FilterType>("all");

    const limit = 20;
    const customerId = 42;
    const professionalId = 1;

    useEffect(() => {
        setLoading(true);
        setError(null);

        const fetchOffers = () => {
            switch (filter) {
                case "open":
                    return listOpenJobOffers(customerId, page, limit);
                case "accepted":
                    return listAcceptedJobOffers(professionalId, page, limit);
                case "aborted":
                    return listAbortedJobOffers(customerId, professionalId, page, limit);
                case "all":
                default:
                    return listJobOffers(page, limit);
            }
        };

        fetchOffers()
            .then(setJobOffers)
            .catch((err: any) => {
                setError(err.message || "Errore durante il caricamento delle offerte");
                setJobOffers([]);
            })
            .finally(() => setLoading(false));
    }, [page, filter]);

    const getStatusBadgeVariant = (state: string) => {
        switch (state.toLowerCase()) {
            case 'open': return 'success';
            case 'accepted': return 'primary';
            case 'aborted': return 'danger';
            default: return 'secondary';
        }
    };

    const renderFilterButton = (filterType: FilterType, label: string) => (
        <Button
            variant={filter === filterType ? 'primary' : 'outline-primary'}
            onClick={() => { setFilter(filterType); setPage(0); }}
            className="w-100 mb-2"
        >
            {label}
        </Button>
    );

    const renderJobOfferCard = (job: JobOffer) => (
        <Card 
            key={job.id} 
            className="mb-3 job-offer-card"
            style={{
                backgroundColor: '#F6F5EC',
                border: '1px solid #14382C'
            }}
        >
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <h3 className="h5 mb-0">{job.description}</h3>
                    <Badge bg={getStatusBadgeVariant(job.state)}>{job.state}</Badge>
                </div>
                
                <Row className="mt-3">
                    <Col md={6}>
                        <div className="d-flex align-items-center mb-2">
                            <BsClock className="me-2" />
                            <span>Durata: {job.duration} giorni</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                            <BsCash className="me-2" />
                            <span>Valore: €{job.value}</span>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex align-items-center mb-2">
                            <BsListCheck className="me-2" />
                            <span>Competenze: {job.skills.join(", ") || "Nessuna"}</span>
                        </div>
                        <div className="d-flex align-items-center">
                            <BsFileText className="me-2" />
                            <span>Note: {job.notes || "Nessuna nota"}</span>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    return (
        <Container fluid className="py-4">
            <Row>
                {/* Lista Offerte */}
                <Col md={9}>
                    <h2 className="mb-4">Offerte di Lavoro</h2>

                    {loading && (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Caricamento...</span>
                            </Spinner>
                        </div>
                    )}

                    {error && (
                        <Alert variant="danger">{error}</Alert>
                    )}

                    {!loading && !error && jobOffers.length === 0 && (
                        <Alert variant="info">Nessuna offerta trovata.</Alert>
                    )}

                    {!loading && !error && jobOffers.map(renderJobOfferCard)}

                    {/* Paginazione */}
                    {!loading && !error && jobOffers.length > 0 && (
                        <div className="d-flex justify-content-between mt-4">
                            <Button
                                variant="outline-primary"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                Indietro
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Avanti
                            </Button>
                        </div>
                    )}
                </Col>

                {/* Sidebar Filtri */}
                <Col md={3}>
                    <Card>
                        <Card.Header className="bg-white">
                            <h5 className="mb-0">Filtri</h5>
                        </Card.Header>
                        <Card.Body>
                            {renderFilterButton("all", "Tutte le offerte")}
                            {renderFilterButton("open", "Aperte")}
                            {renderFilterButton("accepted", "Accettate")}
                            {renderFilterButton("aborted", "Annullate")}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}