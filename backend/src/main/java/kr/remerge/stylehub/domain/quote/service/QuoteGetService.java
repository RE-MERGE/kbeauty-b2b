package kr.remerge.stylehub.domain.quote.service;

import kr.remerge.stylehub.domain.quote.dto.QuoteCreateResponse;
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
public class QuoteGetService {

    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;

    @Transactional(readOnly = true)
    public QuoteCreateResponse getQuote(Integer quoteId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new IllegalArgumentException("견적을 찾을 수 없습니다."));

        List<QuoteItem> items = quoteItemRepository.findByQuote_QuoteId(quoteId);

        return QuoteCreateResponse.from(quote, items);
    }
}
