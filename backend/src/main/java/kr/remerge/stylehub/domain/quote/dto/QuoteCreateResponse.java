package kr.remerge.stylehub.domain.quote.dto;

import kr.remerge.stylehub.domain.quote.entity.Quote;

public record QuoteCreateResponse(
        Integer quoteId,
        String quoteNo,
        String status
) {

    public static QuoteCreateResponse from(
            Quote quote
    ) {
        return new QuoteCreateResponse(
                quote.getQuoteId(),
                quote.getQuoteNo(),
                quote.getStatus()
        );
    }
}
