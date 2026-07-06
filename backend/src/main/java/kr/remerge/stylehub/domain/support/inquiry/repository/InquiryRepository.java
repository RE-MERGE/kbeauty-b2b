package kr.remerge.stylehub.domain.support.inquiry.repository;

import io.lettuce.core.dynamic.annotation.Param;
import kr.remerge.stylehub.domain.support.inquiry.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface InquiryRepository extends JpaRepository<Inquiry, Integer> {

    @Query("select i from Inquiry i left join fetch i.company left join fetch i.createdByUser order by coalesce(i.lastMessageAt, i.createdAt) desc")
    List<Inquiry> findAllOrderByLastMessageAtOrCreatedAt();

    @Query("select i from Inquiry i left join fetch i.company left join fetch i.createdByUser where i.company.companyId = :companyId order by coalesce(i.lastMessageAt, i.createdAt) desc")
    List<Inquiry> findByCompanyId(@Param("companyId") Integer companyId);

    @Query("select i from Inquiry i left join fetch i.company left join fetch i.createdByUser where i.createdByUser.userId = :userId order by coalesce(i.lastMessageAt, i.createdAt) desc")
    List<Inquiry> findByCreatedByUserId(@Param("userId") Integer userId);
}