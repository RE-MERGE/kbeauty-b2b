package kr.remerge.stylehub.domain.order.checkout.dto;

import java.util.List;

public record ContractCheckoutResponse(
        Integer contractId,
        String contractNo,
        List<ContractCheckoutItemResponse> items,
        Long productAmount,
        Long shippingFee,
        Long totalAmount
) {
}
