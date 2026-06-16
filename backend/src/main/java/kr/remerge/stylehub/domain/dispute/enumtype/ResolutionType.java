package kr.remerge.stylehub.domain.dispute.enumtype;

public enum ResolutionType {
    REFUND,          // 환불 처리
    EXCHANGE,        // 교환 처리
    PARTIAL_REFUND,  // 부분 환불 처리
    RE_DELIVERY,     // 재배송 처리
    REJECTED,        // 요청 기각
    ETC              // 기타 처리
}