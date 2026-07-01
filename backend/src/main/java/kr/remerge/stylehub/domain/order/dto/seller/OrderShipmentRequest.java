package kr.remerge.stylehub.domain.order.dto.seller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OrderShipmentRequest(

        @NotBlank(message = "택배사를 선택해주세요.")
        @Size(max = 50, message = "택배사명은 50자 이하여야 합니다.")
        String carrier,

        @NotBlank(message = "운송장 번호를 입력해주세요.")
        @Pattern(
                regexp = "^[0-9-]{8,30}$",
                message = "운송장 번호는 8~30자의 숫자와 하이픈만 입력할 수 있습니다."
        )
        String trackingNumber
) {
}
