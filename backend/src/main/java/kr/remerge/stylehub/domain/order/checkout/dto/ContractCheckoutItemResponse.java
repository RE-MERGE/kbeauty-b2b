package kr.remerge.stylehub.domain.order.checkout.dto;

import kr.remerge.stylehub.domain.contract.entity.ContractItem;

public record ContractCheckoutItemResponse(
        Integer contractItemId,
        String imageUrl,
        String productName,
        String optionSummary,
        Integer quantity,
        Long unitPrice,
        Long totalPrice
) {
    public static ContractCheckoutItemResponse from(ContractItem item) {
        return new ContractCheckoutItemResponse(
                item.getContractItemId(),
                null,
                item.getProductName(),
                item.getOptionSummary(),
                item.getQuantity(),
                item.getUnitPrice(),
                item.getTotalPrice()
        );
    }
}
