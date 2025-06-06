import React, { useEffect, useState } from "react";
import {
    Container, Button, Spinner, Alert, Form, Table, Row, Col, Modal
} from "react-bootstrap";
import {
    listDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument
} from "../../apis/apiDocument";
import { DocumentMetadataDTO } from "../../objects/Document";
import {ApiError, ensureCSRFToken} from "../../apis/apiUtils.tsx";

const ListDocuments: React.FC = () => {
    const [documents, setDocuments] = useState<DocumentMetadataDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        listDocuments({ page, limit })
            .then((data) => {
                setDocuments(data);
                setHasMore(data.length === limit);
                ensureCSRFToken();
            })
            .catch(() => {
                setError("Errore durante il caricamento dei documenti.");
            })
            .finally(() => setLoading(false));
    }, [page, limit]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadDocument(file);
            setPage(0); // Ricarica da inizio
        } catch (error) {
            if (error instanceof ApiError) {
                console.error("Upload failed:", error.message, error.fieldErrors);
            } else {
                console.error("Unexpected error:", error);
            }
            setError("Errore durante l'upload del documento.");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (id: number, name: string) => {
        try {
            const blob = await downloadDocument(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Errore durante il download.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Sei sicuro di voler eliminare questo documento?")) return;
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter(doc => doc.id !== id));
        } catch {
            alert("Errore durante l'eliminazione.");
        }
    };

    const handlePreview = async (id: number, contentType: string) => {
        try {
            const blob = await downloadDocument(id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: contentType });
        } catch {
            alert("Errore durante il caricamento dell'anteprima.");
        }
    };

    const closePreview = () => {
        if (previewDoc) {
            URL.revokeObjectURL(previewDoc.url);
            setPreviewDoc(null);
        }
    };

    return (
        <Container className="py-4">
            <h2 className="mb-4">Gestione Documenti</h2>

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

            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>Carica nuovo documento</Form.Label>
                <Form.Control type="file" onChange={handleFileUpload} disabled={uploading} />
            </Form.Group>

            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && documents.length === 0 && (
                <Alert variant="info">Nessun documento trovato.</Alert>
            )}

            {!loading && !error && documents.length > 0 && (
                <>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Tipo</th>
                            <th>Dimensione (KB)</th>
                            <th>Creato il</th>
                            <th>Azioni</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td>{doc.name}</td>
                                <td>{doc.contentType}</td>
                                <td>{(doc.size / 1024).toFixed(2)}</td>
                                <td>{doc.createdOn?.split("T")[0]}</td>
                                <td>
                                    <Button variant="info" size="sm" onClick={() => handlePreview(doc.id!, doc.contentType)}>
                                        Anteprima
                                    </Button>{" "}
                                    <Button variant="success" size="sm" onClick={() => handleDownload(doc.id!, doc.name)}>
                                        Scarica
                                    </Button>{" "}
                                    <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id!)}>
                                        Elimina
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>

                    <div className="d-flex justify-content-between align-items-center mt-4">
                        <Button
                            className="btn-custom-outline"
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                        >
                            Back
                        </Button>
                        <span>Pagina {page + 1}</span>
                        <Button
                            className="btn-custom"
                            onClick={() => setPage((p) => p + 1)}
                            disabled={!hasMore}
                        >
                            Next
                        </Button>
                    </div>
                </>
            )}

            {/* Modal anteprima */}
            <Modal show={!!previewDoc} onHide={closePreview} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Anteprima Documento</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    {previewDoc?.type.startsWith("image/") ? (
                        <img src={previewDoc.url} alt="Anteprima" style={{ maxWidth: "100%" }} />
                    ) : previewDoc?.type === "application/pdf" ? (
                        <iframe
                            src={previewDoc.url}
                            title="Anteprima PDF"
                            width="100%"
                            height="600px"
                        />
                    ) : (
                        <p>Anteprima non disponibile per questo tipo di file.</p>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ListDocuments;
