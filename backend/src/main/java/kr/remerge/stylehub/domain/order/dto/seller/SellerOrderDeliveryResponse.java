package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.Order;

import java.time.LocalDateTime;

public record SellerOrderDeliveryResponse(

        String receiverName,
        String receiverPhone,
        String receiverZipcode,
        String receiverAddress,
        String receiverAddressDetail,
        String receiverMemo,
        String carrier,
        String trackingNumber,
        LocalDateTime shippedAt,
        LocalDateTime deliveredAt

) {

    public static SellerOrderDeliveryResponse from(Order order) {
        return new SellerOrderDeliveryResponse(
                order.getReceiverName(),
                order.getReceiverPhone(),
                order.getReceiverZipcode(),
                order.getReceiverAddress(),
                order.getReceiverAddressDetail(),
                order.getReceiverMemo(),
                order.getCarrier(),
                order.getTrackingNumber(),
                order.getShippedAt(),
                order.getDeliveredAt()
        );
    }
}
