package kr.remerge.stylehub.domain.quote.dto;

import jakarta.validation.constraints.NotBlank;

public record QuoteStatusUpdateRequest(

        @NotBlank(message = "변경할 상태가 필요합니다.")
        String status // APPROVED, REJECTED, NEGOTIATING, SAMPLE_REQUESTED
) {
}
