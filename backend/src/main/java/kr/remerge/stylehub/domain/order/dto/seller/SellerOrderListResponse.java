package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.entity.OrderItem;
import kr.remerge.stylehub.domain.order.enumtype.OrderItemStatus;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record SellerOrderListResponse(

        Integer orderId,
        String orderNo,

        OrderStatus orderStatus,
        Boolean isSample,

        String representativeProductName,
        Integer itemCount,
        Integer totalQuantity,
        Long productAmount,

        LocalDateTime createdAt,
        SellerOrderPreparationResponse preparation,
        Long myWaitingItemCount
) {

    public static SellerOrderListResponse from(
            Order order,
            List<OrderItem> visibleItems,
            List<OrderItem> allOrderItems
    ) {
        String representativeProductName = visibleItems.isEmpty()
                ? "담당 상품이 없습니다."
                : visibleItems.get(0).getProductName();

        int totalQuantity = visibleItems.stream()
                .mapToInt(OrderItem::getQuantity)
                .sum();

        long productAmount = visibleItems.stream()
                .mapToLong(OrderItem::getTotalPrice)
                .sum();

        long totalItemCount = allOrderItems.size();
        long readyItemCount = allOrderItems.stream()
                .filter(orderItem ->
                        orderItem.getItemStatus() == OrderItemStatus.READY
                )
                .count();

        long myWaitingItemCount = visibleItems.stream()
                .filter(orderItem ->
                        orderItem.getItemStatus() != OrderItemStatus.READY
                )
                .count();

        SellerOrderPreparationResponse preparation =
                SellerOrderPreparationResponse.from(
                        totalItemCount,
                        readyItemCount,
                        totalItemCount > 0
                                && totalItemCount == readyItemCount
                );

        return new SellerOrderListResponse(
                order.getOrderId(),
                order.getOrderNo(),
                order.getStatus(),
                order.getIsSample(),
                representativeProductName,
                visibleItems.size(),
                totalQuantity,
                productAmount,
                order.getCreatedAt(),
                preparation,
                myWaitingItemCount
        );
    }
}
