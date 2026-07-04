package kr.remerge.stylehub.domain.negotiation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NegotiationCreateRequest(

        @NotBlank
        @Size(max = 2000, message = "요청 내용은 2000자 이하여야 합니다.")
        String buyerRequest


) {
}
