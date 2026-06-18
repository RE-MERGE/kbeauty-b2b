package kr.remerge.stylehub.domain.tosspayment;

// 결제 승인 결과 응답
public record PaymentResponse(String paymentKey, String orderId, String status) {}
