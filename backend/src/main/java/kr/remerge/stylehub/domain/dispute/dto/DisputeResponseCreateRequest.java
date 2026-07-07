package kr.remerge.stylehub.domain.dispute.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DisputeResponseCreateRequest(

        @NotBlank
        @Size(max = 3000)
        String content
) {
}
