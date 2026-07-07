package kr.remerge.stylehub.domain.contract.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SellerContractCreateRequest(

        @NotNull(message = "견적서 ID는 필수입니다.")
        Integer quoteId,

        @NotBlank(message = "계약명을 입력해주세요.")
        @Size(max = 150, message = "계약명은 150자 이하여야 합니다.")
        String contractName,

        @NotNull(message = "납품 예정일은 필수입니다.")
        @FutureOrPresent(message = "납품 예정일은 오늘 이후여야 합니다.")
        LocalDate deliveryDate,

        @NotBlank(message = "결제 조건은 필수입니다.")
        @Size(max = 500)
        String paymentTerms,

        @NotBlank(message = "반품·교환 조건은 필수입니다.")
        @Size(max = 2000)
        String returnPolicy,

        @Size(max = 2000)
        String specialTerms
) {
}
