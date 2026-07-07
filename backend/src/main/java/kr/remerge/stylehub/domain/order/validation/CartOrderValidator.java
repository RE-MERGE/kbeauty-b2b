package kr.remerge.stylehub.domain.order.validation;

import kr.remerge.stylehub.domain.cart.entity.CartItem;
import kr.remerge.stylehub.domain.cart.enumtype.CartType;
import kr.remerge.stylehub.domain.order.checkout.dto.CheckoutInvalidItemResponse;
import kr.remerge.stylehub.domain.order.checkout.dto.CheckoutValidationErrorResponse;
import kr.remerge.stylehub.domain.order.checkout.exception.CheckoutValidationException;
import kr.remerge.stylehub.domain.product.entity.Product;
import kr.remerge.stylehub.domain.product.entity.ProductOption;
import kr.remerge.stylehub.global.exception.ErrorCode;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class CartOrderValidator {

    public void validate(List<CartItem> cartItems) {
        List<CheckoutInvalidItemResponse> invalidItems =
                new ArrayList<>();

        for (CartItem cartItem : cartItems) {
            invalidItems.addAll(validateItem(cartItem));
        }

        if (!invalidItems.isEmpty()) {
            throw new CheckoutValidationException(
                    new CheckoutValidationErrorResponse(invalidItems)
            );
        }
    }

    private List<CheckoutInvalidItemResponse> validateItem(
            CartItem cartItem
    ) {
        List<CheckoutInvalidItemResponse> invalidItems =
                new ArrayList<>();

        ProductOption option = cartItem.getProductOption();
        Product product = option.getProduct();
        int quantity = cartItem.getQuantity();

        if (!Boolean.TRUE.equals(option.getIsActive())) {
            invalidItems.add(toInvalidItem(
                    cartItem,
                    ErrorCode.OPTION_INACTIVE,
                    quantity,
                    0
            ));
        }

        if (quantity > option.getStockQuantity()) {
            invalidItems.add(toInvalidItem(
                    cartItem,
                    ErrorCode.OUT_OF_STOCK,
                    quantity,
                    option.getStockQuantity()
            ));
        }

        if (cartItem.getCartType() == CartType.NORMAL) {
            validateNormalOrder(
                    cartItem,
                    product,
                    quantity,
                    invalidItems
            );
        }

        if (cartItem.getCartType() == CartType.SAMPLE) {
            validateSampleOrder(
                    cartItem,
                    product,
                    option,
                    quantity,
                    invalidItems
            );
        }

        return invalidItems;
    }

    private void validateNormalOrder(
            CartItem cartItem,
            Product product,
            int quantity,
            List<CheckoutInvalidItemResponse> invalidItems
    ) {
        if (quantity < product.getMoq()) {
            invalidItems.add(toInvalidItem(
                    cartItem,
                    ErrorCode.MOQ_NOT_MET,
                    quantity,
                    product.getMoq()
            ));
        }
    }

    private void validateSampleOrder(
            CartItem cartItem,
            Product product,
            ProductOption option,
            int quantity,
            List<CheckoutInvalidItemResponse> invalidItems
    ) {
        if (!Boolean.TRUE.equals(product.getSampleAvailable())) {
            invalidItems.add(toInvalidItem(
                    cartItem,
                    ErrorCode.SAMPLE_NOT_AVAILABLE,
                    quantity,
                    0
            ));
        }

        boolean sampleOptionNotConfigured =
                option.getSamplePrice() == null
                        || option.getSampleMaxQuantity() == null;

        if (sampleOptionNotConfigured) {
            invalidItems.add(toInvalidItem(
                    cartItem,
                    ErrorCode.SAMPLE_OPTION_NOT_CONFIGURED,
                    quantity,
                    0
            ));

            return;
        }

        if (quantity > option.getSampleMaxQuantity()) {
            invalidItems.add(toInvalidItem(
                    cartItem,
                    ErrorCode.SAMPLE_LIMIT_EXCEEDED,
                    quantity,
                    option.getSampleMaxQuantity()
            ));
        }
    }

    private CheckoutInvalidItemResponse toInvalidItem(
            CartItem cartItem,
            ErrorCode errorCode,
            int requestedQuantity,
            int availableQuantity
    ) {
        ProductOption option = cartItem.getProductOption();
        Product product = option.getProduct();

        return new CheckoutInvalidItemResponse(
                cartItem.getCartItemId(),
                product.getProductName(),
                option.getOptionLabel(),
                errorCode.name(),
                errorCode.getMessage(),
                requestedQuantity,
                availableQuantity
        );
    }
}