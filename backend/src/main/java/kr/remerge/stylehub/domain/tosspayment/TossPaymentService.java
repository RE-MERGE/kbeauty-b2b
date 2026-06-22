package kr.remerge.stylehub.domain.tosspayment;

import jakarta.transaction.Transactional;
import kr.remerge.stylehub.domain.order.OrderRepository;
import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.tosspayment.entity.Payment;
import kr.remerge.stylehub.domain.tosspayment.enumtype.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TossPaymentService {
    private final TossPaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final TossPaymentsClient tossPaymentsClient;

    @Transactional
    public PaymentResponse confirmPayment(PaymentConfirmRequest dto) {
        Long numericOrderId = Long.valueOf(dto.orderId());
        // 1. [보안 핵심] 결제 요청 전 DB 주문 정보 조회 및 검증
        Order order = orderRepository.findById(numericOrderId)
                .orElseThrow(() -> new IllegalArgumentException("주문 정보를 찾을 수 없습니다."));

        // 가공된 주문 금액과 프론트엔드 결제 요청 금액이 일치하는지 비교 (예시 메서드: order.getAmount())
        if (!order.getAmount().equals(dto.amount())) {
            throw new IllegalArgumentException("결제 요청 금액이 실제 주문 금액과 일치하지 않습니다. 위변조 위험이 있습니다.");
        }

        // 2. 토스 페이먼츠 승인 API 호출
        PaymentResult tossResult = tossPaymentsClient.confirm(dto);

        // 3. 결제 정보 DB 저장
        Payment payment = Payment.builder()
                .paymentKey(dto.paymentKey())
                .orderId(Long.valueOf(order.getOrderId()))
                .status(PaymentStatus.DONE)
                .amount(dto.amount())
                .method(tossResult.method())
                .approvedAt(java.time.OffsetDateTime.parse(tossResult.approvedAt()).toLocalDateTime()) // 시간 파싱 추가
                .build();

        paymentRepository.save(payment);

        // 4. 주문 상태 업데이트 (주문 엔티티 내부 메서드 호출)
        order.markAsPaid();

        return new PaymentResponse(payment.getPaymentKey(), String.valueOf(order.getOrderId()), "DONE");
    }

    @Transactional
    public PaymentResponse cancelPayment(String paymentKey, PaymentCancelRequest request) {
        // 1. DB 결제 정보 찾기
        Payment payment = paymentRepository.findById(paymentKey)
                .orElseThrow(() -> new IllegalArgumentException("결제 정보를 찾을 수 없습니다."));

        if (payment.getStatus() == PaymentStatus.CANCELED) {
            throw new IllegalStateException("이미 취소된 결제입니다.");
        }

        // 2. 토스 API 호출
        tossPaymentsClient.cancel(paymentKey, request);

        // 3. 결제 엔티티 상태 업데이트 (엔티티 내부에 updateStatus 혹은 cancel 메서드 구현 필요)
        payment.updateStatus(PaymentStatus.CANCELED);

        // 4. 주문 정보 조회 후 상태 변경
        Order order = orderRepository.findById(payment.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("연관된 주문 정보를 찾을 수 없습니다."));
        order.cancelOrder();

        return new PaymentResponse(payment.getPaymentKey(), String.valueOf(order.getOrderId()), "CANCELED");
    }
}