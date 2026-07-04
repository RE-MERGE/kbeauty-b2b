package kr.remerge.stylehub.domain.support.inquiry.repository;

import io.lettuce.core.dynamic.annotation.Param;
import kr.remerge.stylehub.domain.support.inquiry.entity.InquiryMessageRead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InquiryMessageReadRepository extends JpaRepository<InquiryMessageRead, Integer> {
    @Query("select count(r) from InquiryMessageRead r where r.message.inquiry.inquiryId = :inquiryId and r.user.userId = :userId")
    Long countByInquiryIdAndUserId(@Param("inquiryId") Integer inquiryId, @Param("userId") Integer userId);

    @Query("select case when count(r) > 0 then true else false end from InquiryMessageRead r where r.message.messageId = :messageId and r.user.userId = :userId")
    boolean existsByMessageAndUser(@Param("messageId") Integer messageId, @Param("userId") Integer userId);
}
