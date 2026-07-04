/**
 * inquiry.types.ts
 * 1:1 문의 관련 타입 및 인터페이스 정의
 */

export type UserRole = "ADMIN" | "PRESIDENT" | "EMPLOYEE";
export type InquiryStatus = "OPEN" | "WAITING" | "ANSWERED" | "CLOSED";
export type CategoryKey = "ACCOUNT" | "ORDER" | "PAYMENT" | "DELIVERY" | "PRODUCT" | "ETC";

/**
 * 1. 문의 목록 및 상세 조회 응답 (DTO)
 */
export interface InquiryResponse {
    inquiryId: number;
    companyId: number;
    createdByUserId: number;
    createdByUserName: string;
    createdByUserRole: UserRole;        // 버블 방향 및 권한 판단용
    category: CategoryKey;              // 백엔드 String 형태를 안전하게 매핑
    title: string;
    status: InquiryStatus;
    assignedAdminName: string | null;
    lastMessageAt: string | null;       // ISO String 또는 백엔드 포맷팅 문자열
    lastMessagePreview: string | null;  // 최신 메시지 미리보기 (별도 쿼리 결과)
    createdAt: string;
    closedAt: string | null;
    unreadCount: number;                // inquiry_message_reads 기반 백엔드 계산값
}

/**
 * 2. 문의 메시지 단건 엔티티/DTO
 */
export interface InquiryMessageResponse {
    messageId: number;
    inquiryId: number;
    senderId: number;
    senderName: string;
    senderRole: UserRole;               // ADMIN이면 관리자, 아니면 유저 버블 처리
    message: string;
    createdAt: string;                  // 메시지 생성 일시
}

/**
 * 3. 새 문의 생성 요청 페이로드 (POST)
 */
export interface CreateInquiryPayload {
    category: CategoryKey;
    title: string;
}

export interface EmployeeResponse {
    userId: number;
    name: string;
}

export interface CompanyResponse {
    companyId: number;
    companyName: string;
}