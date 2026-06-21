package kr.remerge.stylehub.domain.order.checkout.service;

import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.cart.entity.CartItem;
import kr.remerge.stylehub.domain.cart.enumtype.CartType;
import kr.remerge.stylehub.domain.cart.repository.CartRepository;
import kr.remerge.stylehub.domain.order.checkout.dto.CheckoutRequest;
import kr.remerge.stylehub.domain.order.checkout.dto.CheckoutResponse;
import kr.remerge.stylehub.domain.product.entity.Product;
import kr.remerge.stylehub.domain.product.entity.ProductOption;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CheckoutService {

    private final CartRepository cartRepository;

    public CheckoutResponse getCheckout(Integer userId, CheckoutRequest checkoutRequest) {

        List<Integer> cartItemIds = checkoutRequest.cartItemIds().stream()
                .distinct()
                .toList();

        List<CartItem> cartItems = cartRepository.findByCartItemIdInAndUser_UserIdAndCartType(
                cartItemIds,
                userId,
                checkoutRequest.cartType()
        );

        if (cartItems.size() != cartItemIds.size()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        for (CartItem cartItem : cartItems) {
            validateCartItem(cartItem);
        }

        return null;

    }

    private void validateCartItem(CartItem cartItem) {
        ProductOption productOption = cartItem.getProductOption();
        Product product = productOption.getProduct();
        int quantity = cartItem.getQuantity();

        if (!productOption.getIsActive()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        if (quantity > productOption.getStockQuantity()) {
            throw new BusinessException(ErrorCode.OUT_OF_STOCK);
        }

        if (cartItem.getCartType() == CartType.NORMAL && quantity < product.getMoq()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        if (cartItem.getCartType() == CartType.SAMPLE) {
            if (!product.getSampleAvailable()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }

            if (productOption.getSamplePrice() == null || productOption.getSampleMaxQuantity() == null) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }

            if (quantity > productOption.getSampleMaxQuantity()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }
        }
    }
}
