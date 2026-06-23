import axios, {AxiosResponse} from "axios";
import {useAuthStore} from "@/store/useAuthStore";
import {ApiResponse, ErrorResponse} from "./types";

const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.response.use(
    // 1. 정상 응답 처리
    (response: AxiosResponse<ApiResponse<any>>) => {
        return response.data.data;
    },

    // 2. 에러 응답 처리
    async (error) => {
        const originalRequest = error.config;
        const url = originalRequest.url || "";

        // 로그인, 회원가입 등 /auth/ 관련 요청은 가로채지 않고 패스
        const isAuthRequest = url.includes("/auth/");
        if (isAuthRequest) {
            return Promise.reject(error);
        }

        // 액세스 토큰 만료(401) 시 리프레시 토큰으로 자동 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                await axios.post("/api/auth/refresh", {}, { withCredentials: true });
                return api(originalRequest); // 갱신 성공 시 원래 요청 재시도
            } catch (refreshError) {
                // 리프레시 토큰마저 만료된 상황 -> 스토리지 청소만 진행
                // 화면 제어 및 얼럿은 이 에러를 넘겨받은 ProtectedLayout이 처리합니다.
                useAuthStore.getState().clearUser();
                return Promise.reject(refreshError);
            }
        }

        // 3. 백엔드가 보낸 커스텀 에러 메시지 가로채기
        if (error.response?.data) {
            const serverError = error.response.data as ErrorResponse;
            if (serverError.message) {
                error.message = serverError.message;
            }
        } else if (!error.response) {
            error.message = "서버와 연결할 수 없습니다. 서버 구동 상태를 확인하세요.";
        }

        return Promise.reject(error);
    }
);

type CustomizedAxios = {
    get<T = any, R = T, D = any>(url: string, config?: any): Promise<R>;
    post<T = any, R = T, D = any>(url: string, data?: any, config?: any): Promise<R>;
    put<T = any, R = T, D = any>(url: string, data?: any, config?: any): Promise<R>;
    patch<T = any, R = T, D = any>(url: string, data?: any, config?: any): Promise<R>;
    delete<T = any, R = T, D = any>(url: string, config?: any): Promise<R>;
};

export default api as unknown as CustomizedAxios;