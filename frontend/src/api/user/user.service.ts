import api from "@/api/axios";
import {UserResponse} from "../auth/auth.types";
import {
    ChangeEmailOtpRequest, ChangePhoneOtpRequest, VerifyEmailOtpRequest,
    VerifyPhoneOtpRequest, UpdateProfilePayload
} from "./user.types";
// ───────────────────────────────────────────
// 내 정보 조회
// ───────────────────────────────────────────
export const getMe = async (): Promise<UserResponse> => {
    // 인터셉터가 .data.data를 이미 깠기 때문에,
    // 이제 여기서 data.data를 또 쓰지 않고 바로 받아온 결과(UserResponse)를 리턴합니다.
    return await api.get<UserResponse>("/users/me");
};

// ───────────────────────────────────────────
// 내 정보 검증 및 수정
// ───────────────────────────────────────────
/**
 * 내 프로필 탭 진입 전 비밀번호 재확인 검증
 */
export const verifyGatePassword = async (password: string): Promise<void> => {
    // 백엔드 엔드포인트 스펙에 맞게 주소 조정 (예: /users/me/verify-password)
    await api.post("/users/me/verify-password", { currentPassword: password });
};

export const sendEmailChangeOtp = async (request: ChangeEmailOtpRequest): Promise<void> => {
    await api.post<void>("/auth/change-id/send-otp", request);
};

export const verifyEmailChangeOtp = async (request: VerifyEmailOtpRequest): Promise<void> => {
    await api.post<void>("/auth/change-id/verify-otp", request);
};

export const sendPhoneChangeOtp = async (request: ChangePhoneOtpRequest): Promise<void> => {
    await api.post<void>("/auth/change-phone/send-otp", request);
};

export const verifyPhoneChangeOtp = async (request: VerifyPhoneOtpRequest): Promise<void> => {
    await api.post<void>("/auth/change-phone/verify-otp", request);
};

/**
 * 최종 회원 정보 업데이트 (PATCH)
 */
export const updateProfileInfo = async (payload: UpdateProfilePayload) => {
    return await api.patch<UserResponse>("/users/profile", payload);
};