import {CreateMessageDTO, HistoryDTO, MessageDTO} from "../objects/Message.ts";
import { customFetch } from "./apiUtils.tsx";

function buildQueryParams(params: Record<string, any>): string {
    const esc = encodeURIComponent;
    return Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null && params[key] !== "")
        .map(k => esc(k) + "=" + esc(params[k]))
        .join("&");
}

// 1. Lista messaggi paginati (GET con query params)
export function listMessages(
    page = 0,
    limit = 20,
    state = "",
    sortField = "createdDate",
    sortDirection = 1
): Promise<MessageDTO[]> {
    const query = buildQueryParams({ page, limit, state, sortField, sortDirection });
    return customFetch<MessageDTO[]>(`/crm/messages?${query}`);
}

// 2. Crea un nuovo messaggio (POST)
export function createMessage(dto: CreateMessageDTO): Promise<MessageDTO> {
    return customFetch<MessageDTO>("/crm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

// 3. Ottieni messaggio per ID (GET)
export function getMessageById(messageId: number): Promise<any> {
    return customFetch<any>(`/crm/messages/${messageId}`);
}

// 4. Cambia stato messaggio (POST)
export function changeMessageState(messageId: number, dto: HistoryDTO): Promise<any> {
    return customFetch<any>(`/crm/messages/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dto),
    });
}

// 5. Ottieni la cronologia messaggi (GET)
export function getMessageHistory(messageId: number): Promise<HistoryDTO[]> {
    return customFetch<HistoryDTO[]>(`/crm/messages/${messageId}/history`);
}

// 6. Cambia priorità messaggio (PUT)
export function changeMessagePriority(messageId: number, priority: number): Promise<any> {
    return customFetch<any>(`/crm/messages/${messageId}/priority`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(priority),
    });
}