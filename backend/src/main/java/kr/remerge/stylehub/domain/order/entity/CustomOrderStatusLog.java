package kr.remerge.stylehub.domain.order.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.order.enumtype.CustomProcessStep;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "custom_order_process_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomOrderStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "custom_order_status_log_id")
    private Integer customOrderStatusLogId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Enumerated(EnumType.STRING)
    @Column(name = "step", nullable = false)
    private CustomProcessStep step;

    @Column(name = "memo", columnDefinition = "TEXT")
    private String memo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
