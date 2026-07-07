package kr.remerge.stylehub.domain.contract.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record SellerContractUpdateRequest(

        @NotBlank(message = "계약명을 입력해주세요.")
        @Size(max = 150, message = "계약명은 150자 이하여야 합니다.")
        String contractName,

        @NotNull
        @FutureOrPresent
        LocalDate deliveryDate,

        @NotBlank
        String paymentTerms,

        @NotBlank
        @Size(max = 2000)
        String returnPolicy,

        @Size(max = 2000)
        String specialTerms
) {
}
