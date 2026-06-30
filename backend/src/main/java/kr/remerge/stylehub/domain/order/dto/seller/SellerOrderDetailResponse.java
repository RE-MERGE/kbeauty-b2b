package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;

import java.time.LocalDateTime;
import java.util.List;

public record SellerOrderDetailResponse(

        Integer orderId,
        String orderNo,
        String buyerCompanyName,
        OrderStatus orderStatus,
        Boolean isSample,
        LocalDateTime createdAt,
        List<SellerOrderItemResponse> items,
        SellerOrderAmountResponse amountSummary,
        SellerOrderDeliveryResponse delivery,
        List<SellerOrderLogResponse> statusLogs,
        SellerOrderPreparationResponse preparation
) {

    public static SellerOrderDetailResponse from(Order order, List<SellerOrderItemResponse> itemResponses,
                                                 SellerOrderAmountResponse amountResponse, SellerOrderDeliveryResponse deliveryResponse, List<SellerOrderLogResponse> orderLogResponses, SellerOrderPreparationResponse preparationResponse) {

        return new SellerOrderDetailResponse(
                order.getOrderId(),
                order.getOrderNo(),
                order.getBuyer().getCompany().getName(),
                order.getStatus(),
                order.getIsSample(),
                order.getCreatedAt(),
                itemResponses,
                amountResponse,
                deliveryResponse,
                orderLogResponses,
                preparationResponse
        );

    }
}
