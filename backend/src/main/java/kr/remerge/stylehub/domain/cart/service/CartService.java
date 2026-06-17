package kr.remerge.stylehub.domain.cart.service;

import kr.remerge.stylehub.domain.cart.dto.CartAddRequest;
import kr.remerge.stylehub.domain.cart.dto.CartResponse;
import kr.remerge.stylehub.domain.cart.entity.CartItem;
import kr.remerge.stylehub.domain.cart.repository.CartRepository;
import kr.remerge.stylehub.domain.product.entity.ProductOption;
import kr.remerge.stylehub.domain.product.repository.ProductOptionRepository;
import kr.remerge.stylehub.domain.user.UserRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.global.auth.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserRepository userRepository;
    private final ProductOptionRepository productOptionRepository;

    @Transactional
    public void addToCart(CartAddRequest request) {

        User user = findUser(request);
        ProductOption productOption = findProductOption(request);

        cartRepository.findByUserAndProductOptionAndCartType(
                user,
                productOption,
                request.cartType()
        ).ifPresentOrElse(
                cartItem ->  cartItem.addQuantity(request.quantity()),
                () -> cartRepository.save(
                        new CartItem(
                                user,
                                productOption,
                                request.quantity(),
                                request.cartType()
                        )
                )
        );
    }

    public List<CartResponse> getCart(CustomUserDetails userDetails) {

        if (userDetails == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }

        return cartRepository.findByUser_UserId(userDetails.getUserId())
                .stream()
                .map(CartResponse::from)
                .toList();
    }

    private ProductOption findProductOption(CartAddRequest request) {
        return productOptionRepository.findById(request.productOptionId())
                .orElseThrow(() -> new IllegalArgumentException("상품을 조회할 수 없습니다."));
    }

    private User findUser(CartAddRequest request) {
        return userRepository.findById(request.userId()).
                orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다"));
    }
}
