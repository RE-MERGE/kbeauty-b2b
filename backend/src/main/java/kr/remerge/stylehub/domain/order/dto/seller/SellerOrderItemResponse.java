package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.OrderItem;
import kr.remerge.stylehub.domain.order.enumtype.OrderItemStatus;

import java.time.LocalDateTime;

public record SellerOrderItemResponse(
        Integer orderItemId,
        String productName,
        String optionSummary,
        Integer quantity,
        Long unitPrice,
        Long totalPrice,
        String productImageUrl,
        OrderItemStatus itemStatus,
        LocalDateTime preparedAt
) {

    public static SellerOrderItemResponse from(OrderItem orderItem) {

        return new SellerOrderItemResponse(
                orderItem.getOrderItemId(),
                orderItem.getProductName(),
                orderItem.getOptionSummary(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                orderItem.getTotalPrice(),
                orderItem.getProductImageUrl(),
                orderItem.getItemStatus(),
                orderItem.getPreparedAt()
        );
    }

}
