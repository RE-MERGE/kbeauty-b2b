package kr.remerge.stylehub.domain.tosspayment;

public record PaymentResult (
    String mid,
    String version,
    String paymentKey,
    String orderId,
    String method, // 결제 수단
    Long totalAmount,
    String approvedAt
) {}

