package kr.remerge.stylehub.global.notification;

import kr.remerge.stylehub.global.notification.enumtype.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationMessage {

    private NotificationType type;
    private String message;

    // 연관 리소스
    private Integer referenceId;    // 소싱 요청 ID, 주문 ID, 견적 ID 등
    private String referenceType;   // "SOURCING", "ORDER", "QUOTE", "CONTRACT"

    // 타겟 — 셋 중 하나만 채워짐
    private Integer targetUserId;      // 특정 유저
    private Integer targetCompanyId;   // 회사 전체
    private String targetRole;         // ADMIN 브로드캐스트

    // ── 팩토리 메서드 ────────────────────────────────────────────────

    public static NotificationMessage toUser(NotificationType type, Integer userId,
                                             Integer referenceId, String referenceType) {
        return NotificationMessage.builder()
                .type(type)
                .message(type.getDefaultMessage())
                .targetUserId(userId)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
    }

    public static NotificationMessage toCompany(NotificationType type, Integer companyId,
                                                Integer referenceId, String referenceType) {
        return NotificationMessage.builder()
                .type(type)
                .message(type.getDefaultMessage())
                .targetCompanyId(companyId)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
    }

    public static NotificationMessage toAdmin(NotificationType type,
                                              Integer referenceId, String referenceType) {
        return NotificationMessage.builder()
                .type(type)
                .message(type.getDefaultMessage())
                .targetRole("ADMIN")
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
    }
}
