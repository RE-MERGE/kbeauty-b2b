export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string | null;
}

export interface ErrorResponse {
    status: number;
    code: string;
    message: string;
    fieldErrors: Record<string, string> | null;
}