import { create } from "zustand";
import type { UserResponse } from "@/api/auth";

interface AuthState {
    user: UserResponse | null;
    isLoading: boolean;       // 앱 처음 로드 시 로그인 여부 확인 중인지
    isAuthenticated: boolean; // user 존재 여부로 파생

    setUser: (user: UserResponse) => void;
    clearUser: () => void;
    setLoading: (loading: boolean) => void;
}

export const authStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,
    isAuthenticated: false,

    // 로그인 성공 / 내 정보 조회 성공 시 호출
    setUser: (user) =>
        set({ user, isAuthenticated: true, isLoading: false }),

    // 로그아웃 시 호출
    clearUser: () =>
        set({ user: null, isAuthenticated: false, isLoading: false }),

    setLoading: (loading) =>
        set({ isLoading: loading }),
}));