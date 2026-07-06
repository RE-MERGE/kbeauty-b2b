package kr.remerge.stylehub.domain.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import kr.remerge.stylehub.domain.order.enumtype.PaymentMethod;

public record ContractOrderCreateRequest(
        @NotNull Integer contractId,
        @NotNull Integer addressId,
        @NotBlank String receiverName,
        @NotBlank String receiverPhone,
        String receiverMemo,
        @NotNull PaymentMethod paymentMethod
) {
}
