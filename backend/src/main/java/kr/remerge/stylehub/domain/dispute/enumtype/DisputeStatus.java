package kr.remerge.stylehub.domain.dispute.enumtype;

public enum DisputeStatus {
    RECEIVED,   // 이의제기 접수
    REVIEWING,  // 관리자 검토 중
    WAITING_SELLER, // 셀러 답변 대기
    WAITING_BUYER,  // 바이어 추가 답변 대기
    RESOLVED,   // 처리 완료
    REJECTED,   // 기각
    CANCELED    // 이의제기 취소
}