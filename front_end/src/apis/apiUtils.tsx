import Cookies from "js-cookie";

interface ErrorResponseBody {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance: string;
}

type UnprocessableEntityResponseBody = ErrorResponseBody & {
    fieldErrors: {
        [field: string]: string;
    };
};

export class ApiError extends Error {
    fieldErrors?: UnprocessableEntityResponseBody["fieldErrors"];

    constructor(
        message: string,
        fieldErrors?: UnprocessableEntityResponseBody["fieldErrors"],
    ) {
        super(message);
        this.fieldErrors = fieldErrors;
    }
}

function isErrorResponseBody(body: any): body is ErrorResponseBody {
    return body.hasOwnProperty("title") && body.hasOwnProperty("detail");
}

function getCSRFCookie(): string {
    return Cookies.get("XSRF-TOKEN")!;
}

export async function customFetch<T>(
    input: RequestInfo | URL,
    init?: RequestInit,
): Promise<T> {
    let res;
    try {
        if (init && init.method !== "GET") {
            init.headers = {
                ...init.headers,
                "X-XSRF-TOKEN": getCSRFCookie()!,
            };
        }
        res = await fetch(input, init);
    } catch {
        throw new ApiError("Could not connect to the API server");
    }

    if (res.ok) {
        return res.json().catch(() => {});
    } else if (res.status === 422) {
        const errorBody = (await res.json()) as UnprocessableEntityResponseBody;
        throw new ApiError(
            `Server responded with: ${errorBody.title}`,
            errorBody.fieldErrors,
        );
    } else {
        const errorBody = (await res.json()) as ErrorResponseBody;
        const message = `Server responded with ${isErrorResponseBody(errorBody) ? `${errorBody.title}: ${errorBody.detail}` : "Generic error"}`;
        throw new ApiError(message);
    }
}


