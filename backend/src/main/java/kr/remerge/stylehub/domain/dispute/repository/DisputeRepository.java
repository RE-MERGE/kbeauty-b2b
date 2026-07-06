package kr.remerge.stylehub.domain.dispute.repository;

import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeRepository extends JpaRepository<Dispute, Integer> {

    boolean existsByOrder_OrderIdAndStatusIn(Integer orderId, List<DisputeStatus> disputeStatuses);

    List<Dispute> findByBuyer_UserIdOrderByReceivedAtDesc(Integer buyerId);

    List<Dispute> findBySellerCompany_CompanyIdOrderByReceivedAtDesc(Integer companyId);
}
