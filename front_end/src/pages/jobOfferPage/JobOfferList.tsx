import { useEffect, useState } from "react";
import { JobOffer } from "../../objects/JobOffer.ts";
import {listJobOffers} from "../../apis/apiJobOffer.tsx";

export default function ListJobOffers() {
    const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(0);
    const limit = 20;

    useEffect(() => {
        setLoading(true);
        setError(null);

        listJobOffers(page, limit)
            .then(setJobOffers)
            .catch((err: any) => {
                setError(err.message || "Errore durante il caricamento delle offerte");
                setJobOffers([]);
            })
            .finally(() => setLoading(false));
    }, [page]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Offerte di Lavoro</h1>

            {loading && <p>Caricamento...</p>}
            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
                <>
                    <ul className="space-y-4">
                        {jobOffers.map((job) => (
                            <li key={job.id} className="p-4 border rounded-lg shadow-sm">
                                <h2 className="text-lg font-semibold">{job.description}</h2>
                                <p className="text-sm text-gray-600">Stato: {job.state}</p>
                                <p className="text-sm">Durata: {job.duration} giorni</p>
                                <p className="text-sm">Note: {job.notes}</p>
                                <p className="text-sm">Valore: €{job.value}</p>
                                <p className="text-sm mt-2">
                                    <strong>Competenze:</strong>{" "}
                                    {job.skills.join(", ") || "Nessuna"}
                                </p>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-6 flex justify-between">
                        <button
                            onClick={() => setPage((p) => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                        >
                            Indietro
                        </button>
                        <button
                            onClick={() => setPage((p) => p + 1)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Avanti
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}