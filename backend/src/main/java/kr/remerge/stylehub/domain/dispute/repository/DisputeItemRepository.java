package kr.remerge.stylehub.domain.dispute.repository;

import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.entity.DisputeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DisputeItemRepository extends JpaRepository<DisputeItem, Integer> {

    @Query("""
    select distinct d
    from DisputeItem di
    join di.dispute d
    where d.sellerCompany.companyId = :companyId
      and di.orderItem.assignedUser.userId = :userId
    order by d.receivedAt desc
""")
    List<Dispute> findAssignedDisputes(
            @Param("companyId") Integer companyId,
            @Param("userId") Integer userId
    );

}
