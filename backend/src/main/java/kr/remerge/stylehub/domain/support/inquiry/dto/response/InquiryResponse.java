package kr.remerge.stylehub.domain.support.inquiry.dto.response;

import kr.remerge.stylehub.domain.support.inquiry.entity.Inquiry;

import java.time.LocalDateTime;

public record InquiryResponse(
        Integer inquiryId,
        Integer companyId,
        Integer createdByUserId,
        String createdByUserName,    // user.getName()
        String createdByUserRole,    // user.getRole().name() -> "PRESIDENT" | "EMPLOYEE"
        String category,             // "ACCOUNT", "DELIVERY" 등
        String title,
        String status,               // "OPEN", "WAITING", "ANSWERED", "CLOSED"
        String assignedAdminName,    // assignedAdmin != null ? assignedAdmin.getName() : null
        LocalDateTime lastMessageAt,
        String lastMessagePreview,   // 최신 메시지 내역 단건 slice 혹은 subquery text
        LocalDateTime createdAt,
        LocalDateTime closedAt,
        Long unreadCount             // 해당 유저가 안 읽은 메시지 개수 카운트 결과
) {
    public static InquiryResponse of(Inquiry entity, Long unreadCount) {
        return new InquiryResponse(
                entity.getInquiryId(),
                entity.getCompany().getCompanyId(),
                entity.getCreatedByUser().getUserId(),
                entity.getCreatedByUser().getName(),
                entity.getCreatedByUser().getRole().name(),
                entity.getCategory().name(), // 혹은 그냥 문자열
                entity.getTitle(),
                entity.getStatus().name(),
                entity.getAssignedAdmin() != null ? entity.getAssignedAdmin().getName() : null,
                entity.getLastMessageAt(),
                entity.getLastMessagePreview(),
                entity.getCreatedAt(),
                entity.getClosedAt(),
                unreadCount
        );
    }
}