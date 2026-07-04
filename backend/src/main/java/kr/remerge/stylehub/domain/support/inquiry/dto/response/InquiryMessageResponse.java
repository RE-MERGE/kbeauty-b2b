package kr.remerge.stylehub.domain.support.inquiry.dto.response;

import kr.remerge.stylehub.domain.support.inquiry.entity.InquiryMessage;

import java.time.LocalDateTime;

public record InquiryMessageResponse(
        Integer messageId,
        Integer inquiryId,
        Integer senderId,
        String senderName,
        String senderRole, // "ADMIN" | "PRESIDENT" | "EMPLOYEE" -> 프론트 버블 방향 판단용
        String message,
        LocalDateTime createdAt
) {
    // 엔티티를 DTO로 편리하게 변환하기 위한 정적 팩토리 메서드
    public static InquiryMessageResponse from(InquiryMessage entity) {
        String roleName = entity.getSender().getRole().name();
        return new InquiryMessageResponse(
                entity.getMessageId(),
                entity.getInquiry().getInquiryId(),
                entity.getSender().getUserId(), // User 엔티티의 ID 메서드명에 맞춤
                entity.getSender().getName(),
                roleName,
                entity.getMessage(),
                entity.getCreatedAt()
        );
    }
}