// ── 회사 직원 관리 타입 ───────────────────────────────────────────────────────

export type MemberRole = "ADMIN" | "PRESIDENT" | "EMPLOYEE";
export type BusinessRole = "BUYER" | "SELLER" | "BOTH";
export type MemberUserStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "DELETED";

/**
 * 직원 목록 조회 응답 DTO
 */
export interface CompanyMemberResponse {
    userId: number;
    name: string;
    email: string;
    phone: string | null;
    role: MemberRole;
    businessRole: BusinessRole;
    status: MemberUserStatus;
    profileImageUrl: string | null;
    lastLoginAt: string | null;   // ISO string
    createdAt: string;            // ISO string → joinedAt 표시용
}

/**
 * 직원 초대 요청 페이로드
 */
export interface InviteMemberRequest {
    email: string;
}

/**
 * 직원 상태 변경 요청 페이로드
 */
export interface UpdateMemberStatusRequest {
    status: "APPROVED" | "SUSPENDED";
}

/**
 * 직원 권한/역할 수정 요청 페이로드
 */
export interface UpdateMemberRoleRequest {
    role?: MemberRole;
    businessRole?: BusinessRole;
}