package kr.remerge.stylehub.domain.dispute.enumtype;

public enum RequestedAction {
    REFUND,          // 환불 요청
    EXCHANGE,        // 교환 요청
    PARTIAL_REFUND,  // 부분 환불 요청
    RE_DELIVERY,     // 재배송 요청
    ETC              // 기타 요청
}