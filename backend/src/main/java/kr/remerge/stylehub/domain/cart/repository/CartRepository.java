package kr.remerge.stylehub.domain.cart.repository;

import kr.remerge.stylehub.domain.cart.entity.CartItem;
import kr.remerge.stylehub.domain.cart.enumtype.CartType;
import kr.remerge.stylehub.domain.product.entity.ProductOption;
import kr.remerge.stylehub.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Integer> {

    // 장바구니에서 아이템이 중복되는지 확인(유저, 동일 제품의 옵션, 카트 종류)
    Optional<CartItem> findByUserAndProductOptionAndCartType(User user, ProductOption productOption, CartType cartType);

    //유저의 장바구니 조회
    List<CartItem> findByUser_UserId(Integer userId);

}
