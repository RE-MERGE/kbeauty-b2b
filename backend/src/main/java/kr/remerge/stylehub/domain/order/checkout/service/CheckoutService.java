package kr.remerge.stylehub.domain.order.checkout.service;

import kr.remerge.stylehub.domain.cart.dto.CartResponse;
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
import java.util.Map;

import static java.util.stream.Collectors.groupingBy;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CheckoutService {

    private final CartRepository cartRepository;

    public CheckoutResponse getCheckout(Integer userId, CheckoutRequest request) {
        List<CartItem> cartItems = findCartItems(userId, request);

        cartItems.forEach(this::validateCartItem);

        List<CartResponse> items = cartItems.stream()
                .map(CartResponse::from)
                .toList();

        long productAmount = items.stream()
                .mapToLong(CartResponse::totalPrice)
                .sum();

        long shippingFee = calculateShippingFee(items);

        return new CheckoutResponse(
                request.cartType(),
                items,
                productAmount,
                shippingFee,
                productAmount + shippingFee
        );
    }

    private List<CartItem> findCartItems(Integer userId, CheckoutRequest request) {
        List<Integer> cartItemIds = request.cartItemIds().stream()
                .distinct()
                .toList();

        List<CartItem> cartItems = cartRepository
                .findByCartItemIdInAndUser_UserIdAndCartType(
                        cartItemIds,
                        userId,
                        request.cartType()
                );

        if (cartItems.size() != cartItemIds.size()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        return cartItems;
    }

    private void validateCartItem(CartItem cartItem) {

        ProductOption productOption = cartItem.getProductOption();
        Product product = productOption.getProduct();

        int quantity = cartItem.getQuantity();

        if (!productOption.getIsActive() || quantity > productOption.getStockQuantity()) {
            throw new BusinessException(ErrorCode.OUT_OF_STOCK);
        }

        if (cartItem.getCartType() == CartType.NORMAL && quantity < product.getMoq()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        if (cartItem.getCartType() == CartType.SAMPLE) {
            if (!product.getSampleAvailable()
                    || productOption.getSamplePrice() == null
                    || productOption.getSampleMaxQuantity() == null
                    || quantity > productOption.getSampleMaxQuantity()) {
                throw new BusinessException(ErrorCode.INVALID_INPUT);
            }
        }
    }

    private long calculateShippingFee(List<CartResponse> items) {
        Map<Integer, List<CartResponse>> itemsByCompany = items.stream()
                .collect(groupingBy(CartResponse::companyId));

        long shippingFee = 0L;

        for (List<CartResponse> companyItems : itemsByCompany.values()) {
            CartResponse firstItem = companyItems.get(0);
            long companyProductAmount = companyItems.stream()
                    .mapToLong(CartResponse::totalPrice)
                    .sum();

            Long freeShippingThreshold = firstItem.freeShippingThreshold();
            boolean isFreeShipping = freeShippingThreshold != null
                    && companyProductAmount >= freeShippingThreshold;

            if (!isFreeShipping) {
                shippingFee += firstItem.baseShippingFee();
            }
        }

        return shippingFee;
    }
}
