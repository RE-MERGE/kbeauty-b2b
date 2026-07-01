package kr.remerge.stylehub.domain.quote.dto;

import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;

import java.time.LocalDateTime;
import java.util.List;

public record QuoteDetailResponse(

        Integer quoteId,
        String quoteNo,
        Integer sourcingRequestId,

        String brandName,
        String productName,
        String categoryName,
        String material,

        Integer leadTimeDays,
        String deliveryCompany,
        Long shippingFee,
        LocalDateTime validUntil,

        Boolean sampleAvailable,
        String sellerMemo,

        Long subtotalAmount,
        Long totalAmount,
        String status,

        String buyerName,
        String sellerName,
        String companyName,

        LocalDateTime submittedAt,

        List<QuoteItemResponse> items
) {

    public static QuoteDetailResponse from(
            Quote quote,
            List<QuoteItem> items
    ) {
        return new QuoteDetailResponse(
                quote.getQuoteId(),
                quote.getQuoteNo(),
                quote.getSourcingRequest()
                        .getSourcingRequestId(),

                quote.getBrandName(),
                quote.getProductName(),
                quote.getCategoryName(),
                quote.getMaterial(),

                quote.getLeadTimeDays(),
                quote.getDeliveryCompany(),
                quote.getShippingFee(),
                quote.getValidUntil(),

                "AVAILABLE".equals(
                        quote.getSampleAvailable()
                ),
                quote.getSellerMemo(),

                quote.getSubtotalAmount(),
                quote.getTotalAmount(),
                quote.getStatus(),

                quote.getBuyerName(),
                quote.getSellerName(),
                quote.getCompanyName(),

                quote.getSubmittedAt(),

                items.stream()
                        .map(QuoteItemResponse::from)
                        .toList()
        );
    }
}