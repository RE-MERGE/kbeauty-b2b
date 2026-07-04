package kr.remerge.stylehub.domain.support.inquiry.repository;

import io.lettuce.core.dynamic.annotation.Param;
import kr.remerge.stylehub.domain.support.inquiry.entity.InquiryMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InquiryMessageRepository extends JpaRepository<InquiryMessage, Integer> {
    List<InquiryMessage> findByInquiry_InquiryIdOrderByCreatedAtAsc(Integer inquiryId);

    Long countByInquiryInquiryId(Integer inquiryId);

    // 내가 아직 읽지 않은(inquiry_message_reads 에 내 userId 매핑 기록이 없는) 이 방의 모든 메시지 추출
    @Query("select m from InquiryMessage m where m.inquiry.inquiryId = :inquiryId and m.sender.userId != :userId " +
            "and not exists (select r from InquiryMessageRead r where r.message.messageId = m.messageId and r.user.userId = :userId)")
    List<InquiryMessage> findUnreadMessagesByInquiryAndUser(@Param("inquiryId") Integer inquiryId, @Param("userId") Integer userId);
}
