package kr.remerge.stylehub.domain.quote.dto;

import kr.remerge.stylehub.domain.quote.constant.QuoteStatusCode;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;

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

        // 승인/거절/협의/샘플요청 등 상태변경 액션 가능 여부
        // (BUYER 관점 + 본인 작성 or 대표 + 액션 가능한 상태일 때만 true. QuoteStatusService.validateStatusChangeAuthority와 동일 기준)
        Boolean canManage,

        // 협의(재견적)로 생성된 버전인지, 이전 버전과 비교할 수 있도록 이전 조건을 함께 내려준다.
        Integer version,
        Integer parentQuoteId,
        Long previousTotalAmount,
        Long previousSubtotalAmount,
        Integer previousLeadTimeDays,
        Long previousShippingFee,

        List<QuoteItemResponse> items
) {

    // 상태변경 가능한 상태들 (QuoteStatusService.validateStatusTransition 기준, SUBMITTED/NEGOTIATING/SAMPLE_REQUESTED에서 액션 가능)
    private static final Set<String> ACTIONABLE_STATUSES = Set.of(
            QuoteStatusCode.SUBMITTED,
            QuoteStatusCode.NEGOTIATING,
            QuoteStatusCode.SAMPLE_REQUESTED
    );

    public static QuoteDetailResponse from(
            Quote quote,
            List<QuoteItem> items,
            Integer requestingCompanyId,  // authUser.companyId()
            Integer requestingUserId,     // authUser.userId()
            String requestingRole         // authUser.role()
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

        boolean isBuyerWriter = Objects.equals(quote.getBuyer().getUserId(), requestingUserId);
        boolean isPresident = "PRESIDENT".equals(requestingRole);
        boolean isActionableStatus = ACTIONABLE_STATUSES.contains(quote.getStatus());

        boolean canManage = "BUYER".equals(perspective)
                && (isBuyerWriter || isPresident)
                && isActionableStatus;

        Quote parentQuote = quote.getParentQuote();

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

                canManage,

                quote.getVersion(),
                parentQuote == null ? null : parentQuote.getQuoteId(),
                parentQuote == null ? null : parentQuote.getTotalAmount(),
                parentQuote == null ? null : parentQuote.getSubtotalAmount(),
                parentQuote == null ? null : parentQuote.getLeadTimeDays(),
                parentQuote == null ? null : parentQuote.getShippingFee(),

                items.stream()
                        .map(QuoteItemResponse::from)
                        .toList()
        );
    }
}