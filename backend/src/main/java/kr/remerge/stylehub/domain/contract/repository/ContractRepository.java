package kr.remerge.stylehub.domain.contract.repository;

import kr.remerge.stylehub.domain.contract.entity.Contract;
import org.apache.logging.log4j.simple.internal.SimpleProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Integer> {

    boolean existsByQuote_QuoteId(Integer quoteId);

    // 재계약(버전 발행)으로 같은 quote_id에 계약서가 여러 건 존재할 수 있어
    // "현재 계약서"는 항상 버전이 가장 높은 것으로 조회한다.
    Optional<Contract> findFirstByQuote_QuoteIdOrderByVersionDesc(Integer quoteId);

    Optional<Contract> findByContractIdAndQuote_Buyer_UserId(Integer contractId, Integer buyerId);

    List<Contract> findByQuote_QuoteIdIn(List<Integer> quoteIds);

    List<Contract> findByQuote_Buyer_UserIdOrderByCreatedAtDesc(
            Integer buyerId
    );
}
