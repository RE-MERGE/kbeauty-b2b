package kr.remerge.stylehub.domain.negotiation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

// negotiationType이 QUOTE면 quoteId, CONTRACT면 contractId가 필요하다.
// 둘 중 하나만 오기 때문에 @NotNull은 걸지 않고 NegotiationService에서 타입별로 검증한다.
public record NegotiationCreateRequest(

        @Positive
        Integer quoteId,

        @Positive
        Integer contractId,

        @NotBlank
        @Size(max = 2000, message = "요청 내용은 2000자 이하여야 합니다.")
        String content,

        @NotBlank(message = "선택된 협의 유형이 없습