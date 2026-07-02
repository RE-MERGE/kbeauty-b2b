/**
 * 1. 정보 수정 전 비밀번호 검증 요청 객체
 */
export interface VerifyPasswordRequest {
    currentPassword: string;
}

/**
 * 2. 새 이메일/핸드폰 인증번호(OTP) 발송 요청 객체
 */
export interface SendChangeOtpRequest {
    targetValue: string; // 새 이메일 주소 또는 새 핸드폰 번호
}

/**
 * 3. 발송된 인증번호 검증 요청 객체
 */
export interface VerifyChangeOtpRequest {
    targetValue: string; // 새 이메일 주소 또는 새 핸드폰 번호
    otpCode: string;     // 유저가 입력한 인증번호 6자리
}

// ───────────────────────────────────────────
// 회원 정보 변경 인증 (Profile OTP)
// ───────────────────────────────────────────

export interface ChangeEmailOtpRequest {
    target: string; // 변경할 이메일 주소
}

export interface VerifyEmailOtpRequest {
    target: string;
    otpCode: string; // 6자리 인증번호
}

export interface ChangePhoneOtpRequest {
    target: string; // 변경할 연락처
}

export interface VerifyPhoneOtpRequest {
    target: string;
    otpCode: string; // 6자리 인증번호
}

/**
 * 최종 프로필 및 회원 정보 수정 요청
 */
export interface UpdateProfilePayload {
    email: string;
    phone: string;
    profileImageUrl: string | null;
}
