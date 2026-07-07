package kr.remerge.stylehub.domain.negotiation.repository;

import kr.remerge.stylehub.domain.negotiation.entity.NegotiationFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NegotiationFileRepository extends JpaRepository<NegotiationFile, Integer> {

    List<NegotiationFile> findByNegotiationRequest_NegotiationRequestIdOrderByCreatedAtAsc(
            Integer negotiationRequestId
    );
}
