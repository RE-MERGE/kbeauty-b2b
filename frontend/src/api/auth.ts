// src/api/auth.ts
import api from "./axios";
import type { ApiResponse } from "./types";

// ───────────────────────────────────────────
// 요청 타입
// ───────────────────────────────────────────

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignUpRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: "ADMIN" | "PRESIDENT" | "EMPLOYEE";
    businessRole: "BUYER" | "SELLER" | "BOTH";
}

// ───────────────────────────────────────────
// 응답 타입
// ───────────────────────────────────────────

export interface UserResponse {
    userId: number;
    email: string;
    name: string;
    phone: string | null;
    role: "ADMIN" | "PRESIDENT" | "EMPLOYEE";
    businessRole: "BUYER" | "SELLER" | "BOTH";
    profileImageUrl: string | null;
    status: "PENDING" | "APPROVED" | "SUSPENDED" | "DELETED";
    createdAt: string;
}

// ───────────────────────────────────────────
// 로그인
// ───────────────────────────────────────────

// 로그인 성공 시 서버가 쿠키로 토큰 발급
// 응답 본문엔 토큰이 없으므로 별도 반환값 필요 없음
export const login = async (request: LoginRequest): Promise<void> => {
    await api.post<ApiResponse<null>>("/auth/login", request);
};

// ───────────────────────────────────────────
// 회원가입
// ───────────────────────────────────────────

export const signUp = async (request: SignUpRequest): Promise<UserResponse> => {
    const { data } = await api.post<ApiResponse<UserResponse>>("/users/signup", request);
    return data.data;
};

// ───────────────────────────────────────────
// 로그아웃
// ───────────────────────────────────────────

export const logout = async (): Promise<void> => {
    await api.post("/auth/logout");
};

// ───────────────────────────────────────────
// 내 정보 조회
// ───────────────────────────────────────────

export const getMe = async (): Promise<UserResponse> => {
    const { data } = await api.get<ApiResponse<UserResponse>>("/users/me");
    return data.data;
};