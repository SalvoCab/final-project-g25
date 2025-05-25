export interface CreateMessageDTO {
    sender: string;
    subject: string;
    body: string;
    channel: string;
    priority: number;
}

export interface MessageDTO {
    id: number | null;
    sender: string;
    subject: string;
    body: string;
    channel: string;
    currentState: string;
    priority: number;
    createdDate: string | null;
}

export interface HistoryDTO {
    state: string;
    comment: string;
}