package kr.remerge.stylehub.domain.dispute.repository;

import kr.remerge.stylehub.domain.dispute.entity.DisputeResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DisputeResponseRepository
        extends JpaRepository<DisputeResponse, Integer> {

    List<DisputeResponse>
    findByDispute_DisputeIdOrderByCreatedAtAsc(
            Integer disputeId
    );
}