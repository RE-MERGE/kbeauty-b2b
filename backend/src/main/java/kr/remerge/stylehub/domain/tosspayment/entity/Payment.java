package kr.remerge.stylehub.domain.tosspayment.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.tosspayment.enumtype.PaymentStatus;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {
    @Id
    private String paymentKey;

    private Long orderId; // 서비스 단과 맞추기 위해 String에서 Long(또는 상응하는 타입)으로 통일 권장

    @Enumerated(EnumType.STRING)
    private PaymentStatus status;

    private Long amount;
    private String method;
    private LocalDateTime approvedAt;

    @Version
    private Long version;

    @Builder
    public Payment(String paymentKey, Long orderId, PaymentStatus status, Long amount, String method, LocalDateTime approvedAt) {
        this.paymentKey = paymentKey;
        this.orderId = orderId;
        this.status = status;
        this.amount = amount;
        this.method = method;
        this.approvedAt = approvedAt; // 빌더에 추가
    }

    public void updateStatus(PaymentStatus status) {
        this.status = status;
    }
}