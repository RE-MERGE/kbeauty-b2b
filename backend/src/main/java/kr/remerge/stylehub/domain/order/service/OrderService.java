package kr.remerge.stylehub.domain.order.service;

import kr.remerge.stylehub.domain.cart.entity.CartItem;
import kr.remerge.stylehub.domain.cart.repository.CartRepository;
import kr.remerge.stylehub.domain.order.OrderRepository;
import kr.remerge.stylehub.domain.order.dto.OrderCreateRequest;
import kr.remerge.stylehub.domain.order.dto.OrderCreateResponse;
import kr.remerge.stylehub.domain.user.repository.UserRepository;
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
public class OrderService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;

    @Transactional
    public OrderCreateResponse createOrder(Integer userId, OrderCreateRequest request) {

        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<CartItem> cartItems = cartRepository.findByCartItemIdInAndUser_UserIdAndCartType(
                request.cartItemIds(),
                userId,
                request.cartType()
        );

        Map<Integer, List<CartItem>> itemsByCompany = cartItems.stream()
                .collect(groupingBy(
                        cartItem -> cartItem.getProductOption()
                                .getProduct()
                                .getCompany()
                                .getCompanyId()
                ));

        return null;
    }
}
