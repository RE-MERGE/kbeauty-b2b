package kr.remerge.stylehub.domain.negotiation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record NegotiationCreateRequest(

        @NotNull(message = "견적 ID는 필수입니다.")
        @Positive
        Integer quoteId,

        @NotNull(message = "소싱 요청 ID는 필수입니다.")
        @Positive
        Integer sourcingRequestId,

        @NotBlank
        @Size(max = 2000, message = "요청 내용은 2000자 이하여야 합니다.")
        String content,

        @NotNull(message = "선택된 협의 유형이 없습니다.")
        String negotiationType


) {
}
