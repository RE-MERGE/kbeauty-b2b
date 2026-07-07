package kr.remerge.stylehub.domain.order.dto.contract;

import kr.remerge.stylehub.domain.order.entity.Order;

public record ContractOrderCreateResponse(
        Integer orderId,
        String orderNo,
        Long totalAmount
) {
    public static ContractOrderCreateResponse from(Order order) {
        return new ContractOrderCreateResponse(
                order.getOrderId(),
                order.getOrderNo(),
                order.getTotalAmount()
        );
    }
}
