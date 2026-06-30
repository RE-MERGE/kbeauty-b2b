package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.enumtype.PaymentMethod;

public record SellerOrderAmountResponse(

        Long subtotalAmount,
        Long shippingFee,
        Long platformFee,
        Long totalAmount,
        PaymentMethod paymentMethod
) {
    public static SellerOrderAmountResponse from(Order order) {
        return new SellerOrderAmountResponse(
                order.getSubtotalAmount(),
                order.getShippingFee(),
                order.getPlatformFee(),
                order.getTotalAmount(),
                order.getPaymentMethod()
        );
    }
}
