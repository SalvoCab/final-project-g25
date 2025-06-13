import React, { useEffect, useState } from "react";
import {
    Container, Button, Spinner, Alert, Form, Table, Row, Col, Modal
} from "react-bootstrap";
import {
    listDocuments,
    uploadDocument,
    downloadDocument,
    deleteDocument, updateDocumentName
} from "../../apis/apiDocument";
import { DocumentMetadataDTO } from "../../objects/Document";
import {ApiError, ensureCSRFToken} from "../../apis/apiUtils.tsx";
import {BsCloudDownload, BsCloudUpload, BsEye, BsPencilSquare, BsTrash} from "react-icons/bs";
import {MeInterface} from "../../App.tsx";

interface ListDocumentsProps {
    me: MeInterface | null;
}

const ListDocuments: React.FC<ListDocumentsProps> = ({ me }) => {
    const [documents, setDocuments] = useState<DocumentMetadataDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(20);
    const [hasMore, setHasMore] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string } | null>(null);
    const [editingDocId, setEditingDocId] = useState<number | null>(null);
    const [editedName, setEditedName] = useState<string>("");
    const role = me?.role ?? "";
    const permissions = {
        canView: ["manager", "operator", "guest"],
        canAddEdit: ["manager", "operator"],
        canDelete: ["manager"]
    };

    const canAddEdit = permissions.canAddEdit.includes(role);
    const canDelete = permissions.canDelete.includes(role);

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
                setError("Error during the loading of the documents.");
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
            await listDocuments({ page, limit })
                .then((data) => {
                    setDocuments(data);
                    setHasMore(data.length === limit);
                    ensureCSRFToken();
                })
        } catch (error) {
            if (error instanceof ApiError) {
                console.error("Upload failed:", error.message, error.fieldErrors);
            } else {
                console.error("Unexpected error:", error);
            }
            setError("Error during the upload of the document.");
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
            alert("Error during the download of the document.");
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("do you want to delete this document?")) return;
        try {
            await deleteDocument(id);
            setDocuments((prev) => prev.filter(doc => doc.id !== id));
        } catch {
            alert("Error during the deletion of the document.");
        }
    };

    const handlePreview = async (id: number, contentType: string) => {
        try {
            const blob = await downloadDocument(id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: contentType });
        } catch {
            alert("Error during the preview of the document.");
        }
    };

    const closePreview = () => {
        if (previewDoc) {
            URL.revokeObjectURL(previewDoc.url);
            setPreviewDoc(null);
        }
    };

    const startEditing = (doc: DocumentMetadataDTO) => {
        setEditingDocId(doc.id!);
        setEditedName(doc.name);
    };

    const saveEditedName = async () => {
        if (editingDocId == null || editedName.trim() === "") return;

        try {
            const updated = await updateDocumentName(editingDocId, editedName);
            setDocuments(prev =>
                prev.map(doc => doc.id === editingDocId ? { ...doc, name: updated.name } : doc)
            );
            setEditingDocId(null);
            setEditedName("");
            await ensureCSRFToken();
        } catch {
            alert("Error during the update of the document name.");
        }
    };

    const cancelEditing = () => {
        setEditingDocId(null);
        setEditedName("");
    };


    return (
        <Container className="py-4">
            <h2 className="mb-4">Documents list</h2>

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
            {canAddEdit && (
                <Form.Group controlId="formFile" className="mb-3">
                    <Form.Label>Load new document</Form.Label>
                    <div className="d-flex align-items-center">
                        <Form.Control
                            type="file"
                            name="file"
                            id="hiddenFileInput"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            style={{ display: "none" }}
                        />
                        <Button
                            className="btn-custom"
                            onClick={() => document.getElementById("hiddenFileInput")?.click()}
                            disabled={uploading}
                        >
                            <BsCloudUpload /> Add file
                        </Button>
                        <span className="ms-3">
                            {document.querySelector<HTMLInputElement>('#hiddenFileInput')?.files?.[0] ? (
                                <>
                                    <strong>File added: </strong>
                                    {document.querySelector<HTMLInputElement>('#hiddenFileInput')?.files?.[0]?.name}
                                </>
                          ) : (
                              "No file selected"
                          )}
                        </span>

                    </div>
                </Form.Group>
            )}
            {loading && (
                <div className="text-center py-5">
                    <Spinner animation="border" />
                </div>
            )}

            {error && <Alert variant="danger">{error}</Alert>}

            {!loading && !error && documents.length === 0 && (
                <Alert variant="info">No documents found.</Alert>
            )}

            {!loading && !error && documents.length > 0 && (
                <>
                    <Table striped bordered hover>
                        <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Dimension (KB)</th>
                            <th>Created on</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id}>
                                <td title={doc.name}>
                                    <div className="d-flex justify-content-between align-items-center">
                                        {editingDocId === doc.id ? (
                                            <>
                                                <Form.Control
                                                    size="sm"
                                                    type="text"
                                                    value={editedName}
                                                    onChange={(e) => setEditedName(e.target.value)}
                                                    className="me-2"
                                                />
                                                <div className="btn-group">
                                                    <Button size="sm" variant="success" onClick={saveEditedName}>Save</Button>
                                                    <Button size="sm" variant="secondary" onClick={cancelEditing}>Cancel</Button>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                            <span>
                                                {doc.name.length > 30 ? doc.name.slice(0, 30) + "..." : doc.name}
                                            </span>
                                                {canAddEdit && (
                                                    <Button
                                                        size="sm"
                                                        className="btn-custom-outline"
                                                        onClick={() => startEditing(doc)}
                                                    >
                                                        <BsPencilSquare /> Edit
                                                    </Button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </td>
                                <td>{doc.contentType}</td>
                                <td>{(doc.size / 1024).toFixed(2)}</td>
                                <td>{doc.createdOn?.split("T")[0]}</td>
                                <td>
                                    <Button variant="outline-dark" size="sm" onClick={() => handlePreview(doc.id!, doc.contentType)}>
                                        <BsEye /> View
                                    </Button>{" "}
                                    <Button className="btn-custom" size="sm" onClick={() => handleDownload(doc.id!, doc.name)}>
                                        <BsCloudDownload /> Download
                                    </Button>{" "}
                                    {canDelete && (
                                        <Button variant="danger" size="sm" onClick={() => handleDelete(doc.id!)}>
                                                <BsTrash /> Delete
                                        </Button>
                                    )}
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
                        <span>Page {page + 1}</span>
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
