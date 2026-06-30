package kr.remerge.stylehub.domain.quote.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class QuoteStatusUpdateRequest {
    private String status; // APPROVED, REJECTED, NEGOTIATING, SAMPLE_REQUESTED
}
