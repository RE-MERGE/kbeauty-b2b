package kr.remerge.stylehub.domain.quote.service;

import kr.remerge.stylehub.domain.quote.dto.QuoteSellerListResponse;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;
import kr.remerge.stylehub.domain.quote.repository.QuoteItemRepository;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuoteSellerListService {

    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;

    // TODO: JWT 연동 후 SecurityContext에서 꺼내는 걸로 교체
    private static final Integer DUMMY_SELLER_ID = 10;

    @Transactional(readOnly = true)
    public List<QuoteSellerListResponse> getMyQuotes(Integer sourcingRequestId) {
        List<Quote> quotes = quoteRepository.findBySeller_UserIdAndSourcingRequest_SourcingRequestId(
                DUMMY_SELLER_ID, sourcingRequestId);

        return quotes.stream()
                .map(quote -> {
                    List<QuoteItem> items = quoteItemRepository.findByQuote_QuoteId(quote.getQuoteId());
                    Long firstUnitPrice = items.stream()
                            .filter(i -> !i.getIsSample())
                            .findFirst()
                            .map(QuoteItem::getUnitPrice)
                            .orElse(null);
                    return QuoteSellerListResponse.from(quote, firstUnitPrice);
                })
                .toList();
    }
}
