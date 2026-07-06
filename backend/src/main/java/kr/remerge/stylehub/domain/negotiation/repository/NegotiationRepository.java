package kr.remerge.stylehub.domain.negotiation.repository;

import kr.remerge.stylehub.domain.negotiation.entity.Negotiation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NegotiationRepository extends JpaRepository<Negotiation, Integer> {

    List<Negotiation>
    findByBuyer_UserIdOrSeller_UserIdOrderByUpdatedAtDesc(
            Integer buyerId,
            Integer sellerId
    );

    Optional<Negotiation>
    findFirstByQuote_QuoteIdAndBuyer_UserIdAndStatusOrderByOpenedAtDesc(
            Integer quoteId,
            Integer buyerId,
            String status
    );
}
