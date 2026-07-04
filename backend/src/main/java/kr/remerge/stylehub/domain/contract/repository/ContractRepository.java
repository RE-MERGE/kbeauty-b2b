package kr.remerge.stylehub.domain.contract.repository;

import kr.remerge.stylehub.domain.contract.entity.Contract;
import org.apache.logging.log4j.simple.internal.SimpleProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Integer> {

    boolean existsByQuote_QuoteId(Integer quoteId);

    Optional<Contract> findByQuote_QuoteId(Integer quoteId);

    Optional<Contract> findByContractIdAndQuote_Buyer_UserId(Integer contractId, Integer buyerId);

    List<Contract> findByQuote_QuoteIdIn(List<Integer> quoteIds);
}
