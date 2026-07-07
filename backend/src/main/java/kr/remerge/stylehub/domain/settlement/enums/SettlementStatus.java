package kr.remerge.stylehub.domain.settlement.enums;

public enum SettlementStatus {
    PENDING,    // 정산 대기
    COMPLETED,  // 정산 완료 (지급 승인 완료)
    REFUNDED,    // 환불 요청/완료
    DISPUTE
}
