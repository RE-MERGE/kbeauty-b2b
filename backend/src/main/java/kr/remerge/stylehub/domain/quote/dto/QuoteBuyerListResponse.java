package kr.remerge.stylehub.domain.quote.dto;

import kr.remerge.stylehub.domain.quote.entity.Quote;

import java.time.LocalDateTime;

public record QuoteBuyerListResponse(
        Integer quoteId,
        String quoteNo,
        Integer sourcingRequestId,
        String productName,
        String sellerName,
        String companyName,
        Long totalAmount,
        Integer leadTimeDays,
        LocalDateTime validUntil,
        Boolean sampleAvailable,
        String status,
        LocalDateTime submittedAt
) {

    public static QuoteBuyerListResponse from(Quote quote) {
        return new QuoteBuyerListResponse(
                quote.getQuoteId(),
                quote.getQuoteNo(),
                quote.getSourcingRequest().getSourcingRequestId(),
                quote.getProductName(),
                quote.getSellerName(),
                quote.getCompanyName(),
                quote.getTotalAmount(),
                quote.getLeadTimeDays(),
                quote.getValidUntil(),
                "AVAILABLE".equals(quote.getSampleAvailable()),
                quote.getStatus(),
                quote.getSubmittedAt()
        );
    }
}