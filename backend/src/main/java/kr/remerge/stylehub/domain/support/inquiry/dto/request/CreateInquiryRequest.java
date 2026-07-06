package kr.remerge.stylehub.domain.support.inquiry.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreateInquiryRequest(
        @NotBlank(message = "카테고리는 필수 선택 사항입니다.")
        @Pattern(regexp = "ACCOUNT|ORDER|PAYMENT|DELIVERY|PRODUCT|ETC", message = "유효하지 않은 카테고리입니다.")
        String category,

        @NotBlank(message = "제목을 입력해주세요.")
        @Size(max = 100, message = "제목은 최대 100자까지입니다.")
        String title
) {
}