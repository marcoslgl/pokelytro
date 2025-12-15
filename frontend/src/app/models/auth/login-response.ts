export interface LoginResponse {
    token: string;
    message: string;
    user: {
        _id: string;
        username: string;
        email: string;
    };
}