package kr.remerge.stylehub.domain.negotiation.repository;

import kr.remerge.stylehub.domain.negotiation.entity.NegotiationRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NegotiationRequestRepository
        extends JpaRepository<NegotiationRequest, Integer> {

    List<NegotiationRequest>
    findByNegotiation_NegotiationIdInOrderByCreatedAtDesc(
            List<Integer> negotiationIds
    );
}
