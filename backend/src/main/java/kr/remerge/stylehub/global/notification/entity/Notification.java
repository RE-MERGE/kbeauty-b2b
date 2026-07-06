package kr.remerge.stylehub.global.notification.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.global.notification.enumtype.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notif_user",    columnList = "target_user_id, created_at DESC"),
                @Index(name = "idx_notif_company", columnList = "target_company_id, created_at DESC"),
                @Index(name = "idx_notif_role",    columnList = "target_role, created_at DESC"),
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer notificationId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private NotificationType type;

    @Column(nullable = false, length = 255)
    private String message;

    // 연관 리소스 ID (소싱 요청 ID, 주문 ID, 견적 ID 등)
    @Column(name = "reference_id")
    private Integer referenceId;

    // 연관 리소스 타입 (SOURCING, ORDER, QUOTE, CONTRACT 등)
    @Column(name = "reference_type", length = 30)
    private String referenceType;

    // 타겟: 셋 중 하나만 채워짐
    @Column(name = "target_user_id")
    private Integer targetUserId;       // 특정 유저한테만

    @Column(name = "target_company_id")
    private Integer targetCompanyId;    // 회사 전체한테

    @Column(name = "target_role", length = 20)
    private String targetRole;          // ADMIN 브로드캐스트

    @Builder.Default
    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public void markAsRead() {
        this.isRead = true;
    }
}
