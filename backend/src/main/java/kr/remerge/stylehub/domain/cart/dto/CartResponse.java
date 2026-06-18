package kr.remerge.stylehub.domain.cart.dto;

import kr.remerge.stylehub.domain.cart.entity.CartItem;
import kr.remerge.stylehub.domain.cart.enumtype.CartType;
import kr.remerge.stylehub.domain.product.entity.Product;
import kr.remerge.stylehub.domain.product.entity.ProductOption;

import java.util.List;

public record CartResponse(

        Integer cartItemId,
        Integer productId,
        Integer productOptionId,

        String productName,
        String optionLabel,
        List<CartOptionResponse> options,

        Long unitPrice,
        Integer quantity,
        Long totalPrice,

        Boolean isChecked,
        CartType cartType
) {

    public static CartResponse from(CartItem cartItem) {
        ProductOption productOption = cartItem.getProductOption();
        Product product = productOption.getProduct();

        List<CartOptionResponse> options = getCartOptionResponses(productOption);

        Long unitPrice = product.getUnitPrice() + productOption.getAdditionalPrice();
        Long totalPrice = unitPrice * cartItem.getQuantity();

        return new CartResponse(
                cartItem.getCartItemId(),
                product.getProductId(),
                productOption.getProductOptionId(),

                product.getProductName(),
                productOption.getOptionLabel(),
                options,

                unitPrice,
                cartItem.getQuantity(),
                totalPrice,

                cartItem.getIsChecked(),
                cartItem.getCartType()
        );
    }

    private static List<CartOptionResponse> getCartOptionResponses(ProductOption productOption) {

        return productOption.getOptionValues()
                .stream()
                .map(value -> new CartOptionResponse(
                        value.getOptionName(),
                        value.getOptionValue()
                ))
                .toList();
    }
}
