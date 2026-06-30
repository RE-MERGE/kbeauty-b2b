package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.OrderItem;
import kr.remerge.stylehub.domain.order.enumtype.OrderItemStatus;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;

import java.time.LocalDateTime;
import java.util.Objects;

public record SellerOrderItemResponse(
        Integer orderItemId,
        String productName,
        String optionSummary,
        Integer quantity,
        Long unitPrice,
        Long totalPrice,
        String productImageUrl,
        OrderItemStatus itemStatus,
        LocalDateTime preparedAt,
        boolean assignedToMe,
        boolean canPrepare
) {

    public static SellerOrderItemResponse from(OrderItem orderItem, User user) {
        boolean assignedToMe = Objects.equals(
                orderItem.getAssignedUser().getUserId(),
                user.getUserId()
        );
        boolean canPrepare =
                user.getRole() == UserRole.EMPLOYEE && assignedToMe;

        return new SellerOrderItemResponse(
                orderItem.getOrderItemId(),
                orderItem.getProductName(),
                orderItem.getOptionSummary(),
                orderItem.getQuantity(),
                orderItem.getUnitPrice(),
                orderItem.getTotalPrice(),
                orderItem.getProductImageUrl(),
                orderItem.getItemStatus(),
                orderItem.getPreparedAt(),
                assignedToMe,
                canPrepare
        );
    }

}
