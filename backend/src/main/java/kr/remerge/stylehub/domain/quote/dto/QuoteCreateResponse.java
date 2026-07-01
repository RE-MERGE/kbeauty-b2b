package kr.remerge.stylehub.domain.quote.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class QuoteCreateResponse {

    @JsonProperty("quote_id")
    private Integer quoteId;

    @JsonProperty("quote_no")
    private String quoteNo;

    @JsonProperty("sourcing_id")
    private Integer sourcingId;

    @JsonProperty("brand_name")
    private String brandName;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("category_name")
    private String categoryName;

    private String material;

    @JsonProperty("lead_time_days")
    private Integer leadTimeDays;

    @JsonProperty("delivery_company")
    private String deliveryCompany;

    @JsonProperty("shipping_fee")
    private Long shippingFee;

    @JsonProperty("valid_until")
    private String validUntil;

    @JsonProperty("sample_available")
    private String sampleAvailable;

    @JsonProperty("seller_memo")
    private String sellerMemo;

    @JsonProperty("subtotal_amount")
    private Long subtotalAmount;

    @JsonProperty("total_amount")
    private Long totalAmount;

    private String status;

    @JsonProperty("submitted_at")
    private String submittedAt;

    @JsonProperty("seller_name")
    private String sellerName;

    @JsonProperty("company_name")
    private String companyName;

    @JsonProperty("quote_items")
    private List<QuoteItemDto> quoteItems;

    @Getter
    @Builder
    public static class QuoteItemDto {
        @JsonProperty("quote_item_id")
        private Integer quoteItemId;
        @JsonProperty("option_summary")
        private String optionSummary;
        private Integer quantity;
        @JsonProperty("unit_price")
        private Long unitPrice;
        @JsonProperty("total_price")
        private Long totalPrice;
        @JsonProperty("is_sample")
        private Boolean isSample;
    }

    public static QuoteCreateResponse from(Quote quote, List<QuoteItem> items) {
        return QuoteCreateResponse.builder()
                .quoteId(quote.getQuoteId())
                .quoteNo(quote.getQuoteNo())
                .sourcingId(quote.getSourcingRequest().getSourcingRequestId())
                .brandName(quote.getBrandName())
                .productName(quote.getProductName())
                .categoryName(quote.getCategoryName())
                .material(quote.getMaterial())
                .leadTimeDays(quote.getLeadTimeDays())
                .deliveryCompany(quote.getDeliveryCompany())
                .shippingFee(quote.getShippingFee())
                .validUntil(quote.getValidUntil().toString())
                .sampleAvailable(quote.getSampleAvailable())
                .sellerMemo(quote.getSellerMemo())
                .subtotalAmount(quote.getSubtotalAmount())
                .totalAmount(quote.getTotalAmount())
                .status(quote.getStatus())
                .submittedAt(quote.getSubmittedAt().toString())
                .sellerName(quote.getSellerName())
                .companyName(quote.getCompanyName())
                .quoteItems(items.stream()
                        .map(item -> QuoteItemDto.builder()
                                .quoteItemId(item.getQuoteItemId())
                                .optionSummary(item.getOptionSummary())
                                .quantity(item.getQuantity())
                                .unitPrice(item.getUnitPrice())
                                .totalPrice(item.getTotalPrice())
                                .isSample(item.getIsSample())
                                .build())
                        .toList())
                .build();
    }
}
