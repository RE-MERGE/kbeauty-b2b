package kr.remerge.stylehub.domain.quote.service;

import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class QuoteStatusUpdateService {

    private final QuoteRepository quoteRepository;

    private static final Set<String> ALLOWED_STATUSES = Set.of(
            "APPROVED", "REJECTED", "NEGOTIATING", "SAMPLE_REQUESTED"
    );

    // 채택 시 자동으로 거절 처리할 대상 상태
    private static final Set<String> AUTO_REJECT_TARGET_STATUSES = Set.of(
            "SUBMITTED", "NEGOTIATING", "SAMPLE_REQUESTED"
    );

    @Transactional
    public void updateStatus(Integer quoteId, String status) {
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new IllegalArgumentException("허용되지 않은 상태값입니다: " + status);
        }

        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("견적을 찾을 수 없습니다."));

        boolean isFromSubmitted = "SUBMITTED".equals(quote.getStatus());
        boolean isFromSampleRequested = "SAMPLE_REQUESTED".equals(quote.getStatus()) && "APPROVED".equals(status);

        if (!isFromSubmitted && !isFromSampleRequested) {
            throw new IllegalStateException("이미 처리된 견적이거나 허용되지 않은 상태 전환입니다. 현재 상태: " + quote.getStatus());
        }

        quote.changeStatus(status);

        // 채택되면 같은 소싱 요청의 나머지 견적들을 자동으로 거절 처리
        if ("APPROVED".equals(status)) {
            autoRejectOtherQuotes(quote);
        }
    }

    private void autoRejectOtherQuotes(Quote approvedQuote) {
        Integer sourcingRequestId = approvedQuote.getSourcingRequest().getSourcingRequestId();

        List<Quote> others = quoteRepository.findBySourcingRequest_SourcingRequestIdAndQuoteIdNot(
                sourcingRequestId, approvedQuote.getQuoteId());

        others.stream()
                .filter(q -> AUTO_REJECT_TARGET_STATUSES.contains(q.getStatus()))
                .forEach(q -> q.changeStatus("REJECTED"));
    }
}
