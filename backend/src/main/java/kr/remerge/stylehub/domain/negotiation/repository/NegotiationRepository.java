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

    // 같은 견적/계약 + 같은 바이어라면 이전 협의가 AGREED/CLOSED로 끝났더라도
    // 상태와 무관하게 항상 같은 행(Negotiation)을 재사용하기 위한 조회.
    // (셀러 협의관리 화면에서 한 건에 대한 협의 이력이 여러 행으로 쪼개지지 않도록 함)
    Optional<Negotiation>
    findFirstByQuote_QuoteIdAndBuyer_UserIdOrderByOpenedAtDesc(
            Integer quoteId,
            Integer buyerId
    );

    Optional<Negotiation>
    findFirstByContract_ContractIdAndBuyer_UserIdOrderByOpenedAtDesc(
            Integer contractId,
            Integer buyerId
    );
}
