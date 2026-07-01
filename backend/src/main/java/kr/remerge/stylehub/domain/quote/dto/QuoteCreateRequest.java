package kr.remerge.stylehub.domain.quote.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.List;

public record QuoteCreateRequest(

        @NotNull(message = "소싱 요청 ID가 필요합니다.")
        Integer sourcingRequestId,

        @Size(max = 100)
        String brandName,

        @NotBlank(message = "상품명을 입력해주세요.")
        @Size(max = 150)
        String productName,

        @Size(max = 100)
        String categoryName,

        @Size(max = 255)
        String material,

        @NotNull(message = "납기일을 입력해주세요.")
        @Positive(message = "납기일은 1일 이상이어야 합니다.")
        Integer leadTimeDays,

        @Size(max = 50)
        String deliveryCompany,

        @NotNull
        @PositiveOrZero(message = "배송비는 0원 이상이어야 합니다.")
        Long shippingFee,

        @NotNull(message = "견적 유효기간을 입력해주세요.")
        @Future(message = "견적 유효기간은 현재보다 이후여야 합니다.")
        LocalDateTime validUntil,

        @NotNull
        Boolean sampleAvailable,

        @Size(max = 2000)
        String sellerMemo,

        @NotEmpty(message = "견적 상품을 한 개 이상 입력해주세요.")
        @Valid
        List<Item> items

) {

    public record Item(

            @NotBlank(message = "옵션 정보를 입력해주세요.")
            @Size(max = 255)
            String optionSummary,

            @NotNull
            @Positive(message = "수량은 1개 이상이어야 합니다.")
            Integer quantity,

            @NotNull
            @PositiveOrZero(message = "단가는 0원 이상이어야 합니다.")
            Long unitPrice,

            @NotNull
            Boolean sample
    ) {
    }
}