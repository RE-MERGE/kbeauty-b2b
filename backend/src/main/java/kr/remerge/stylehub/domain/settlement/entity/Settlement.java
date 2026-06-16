package kr.remerge.stylehub.domain.settlement.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "settlements",
        indexes = {
                @Index(name = "idx_settlement_status", columnList = "status")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Settlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "settlement_id")
    private Integer settlementId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_no", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "total_amount", nullable = false)
    private Long totalAmount;

    @Builder.Default
    @Column(name = "platform_fee", nullable = false)
    private Long platformFee = 0L;

    @Builder.Default
    @Column(name = "final_amount", nullable = false)
    private Long finalAmount = 0L;

    @Column(nullable = false, length = 50)
    private String status;

    @Column(name = "settled_at", nullable = false)
    private LocalDateTime settledAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}