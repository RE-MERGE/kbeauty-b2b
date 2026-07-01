package kr.remerge.stylehub.domain.quote.dto;

import kr.remerge.stylehub.domain.quote.entity.QuoteItem;

public record QuoteItemResponse(
        Integer quoteItemId,
        String optionSummary,
        Integer quantity,
        Long unitPrice,
        Long totalPrice,
        Boolean isSample
) {

    public static QuoteItemResponse from(QuoteItem item) {

        return new QuoteItemResponse(
                item.getQuoteItemId(),
                item.getOptionSummary(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice(),
                item.getIsSample()
        );

    }
}