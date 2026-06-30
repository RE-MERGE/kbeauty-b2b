package kr.remerge.stylehub.domain.quote.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class QuoteCreateRequest {

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
    private String validUntil;           // ISO 8601 string (프론트에서 getValidUntil() 결과)

    @JsonProperty("sample_available")
    private String sampleAvailable;

    @JsonProperty("seller_memo")
    private String sellerMemo;

    @JsonProperty("subtotal_amount")
    private Long subtotalAmount;

    @JsonProperty("total_amount")
    private Long totalAmount;

    @JsonProperty("quote_items")
    private List<QuoteItemDto> quoteItems;

    @JsonProperty("sample_items")
    private List<SampleItemDto> sampleItems;

    @Getter
    @NoArgsConstructor
    public static class QuoteItemDto {
        @JsonProperty("option_summary")
        private String optionSummary;
        private Integer quantity;
        @JsonProperty("unit_price")
        private Long unitPrice;
        @JsonProperty("total_price")
        private Long totalPrice;
    }

    @Getter
    @NoArgsConstructor
    public static class SampleItemDto {
        @JsonProperty("sample_name")
        private String sampleName;
        private Integer quantity;
        @JsonProperty("unit_price")
        private Long unitPrice;
        @JsonProperty("total_price")
        private Long totalPrice;
        private String memo;
    }
}
