package kr.remerge.stylehub.domain.quote.dto;

import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

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

        String perspective, // "BUYER" | "SELLER" — 요청한 회사가 이 견적에서 어느 쪽인지

        List<QuoteItemResponse> items
) {

    public static QuoteDetailResponse from(
            Quote quote,
            List<QuoteItem> items,
            Integer requestingCompanyId  // authUser.companyId()
    ) {
        Integer buyerCompanyId = quote.getSourcingRequest().getBuyerCompanyId();
        Integer sellerCompanyId = quote.getCompany().getCompanyId();

        String perspective;
        if (Objects.equals(requestingCompanyId, buyerCompanyId)) {
            perspective = "BUYER";
        } else if (Objects.equals(requestingCompanyId, sellerCompanyId)) {
            perspective = "SELLER";
        } else {
            perspective = "UNKNOWN"; // FORBIDDEN은 서비스 레이어에서 던지는 게 맞아서 여기선 일단 UNKNOWN
        }

        return new QuoteDetailResponse(
                quote.getQuoteId(),
                quote.getQuoteNo(),
                quote.getSourcingRequest().getSourcingRequestId(),

                quote.getBrandName(),
                quote.getProductName(),
                quote.getCategoryName(),
                quote.getMaterial(),

                quote.getLeadTimeDays(),
                quote.getDeliveryCompany(),
                quote.getShippingFee(),
                quote.getValidUntil(),

                "AVAILABLE".equals(quote.getSampleAvailable()),
                quote.getSellerMemo(),

                quote.getSubtotalAmount(),
                quote.getTotalAmount(),
                quote.getStatus(),

                quote.getBuyerName(),
                quote.getSellerName(),
                quote.getCompanyName(),

                quote.getSubmittedAt(),

                perspective,

                items.stream()
                        .map(QuoteItemResponse::from)
                        .toList()
        );
    }
}