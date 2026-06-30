package kr.remerge.stylehub.domain.quote.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class QuoteSellerListResponse {

    @JsonProperty("quote_id")
    private Integer quoteId;

    @JsonProperty("quote_no")
    private String quoteNo;

    @JsonProperty("sourcing_id")
    private Integer sourcingId;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("unit_price")
    private Long unitPrice;       // 첫 품목 단가 (READY 타입 표시용)

    @JsonProperty("total_amount")
    private Long totalAmount;

    @JsonProperty("lead_time_days")
    private Integer leadTimeDays;

    @JsonProperty("valid_until")
    private String validUntil;

    private String status;

    @JsonProperty("submitted_at")
    private String submittedAt;

    public static QuoteSellerListResponse from(Quote quote, Long firstItemUnitPrice) {
        return QuoteSellerListResponse.builder()
                .quoteId(quote.getQuoteId())
                .quoteNo(quote.getQuoteNo())
                .sourcingId(quote.getSourcingRequest().getSourcingRequestId())
                .productName(quote.getProductName())
                .unitPrice(firstItemUnitPrice)
                .totalAmount(quote.getTotalAmount())
                .leadTimeDays(quote.getLeadTimeDays())
                .validUntil(quote.getValidUntil().toString())
                .status(quote.getStatus())
                .submittedAt(quote.getSubmittedAt().toString())
                .build();
    }
}
