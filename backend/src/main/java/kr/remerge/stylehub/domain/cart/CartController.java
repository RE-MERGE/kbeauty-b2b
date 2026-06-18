package kr.remerge.stylehub.domain.cart;

import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.cart.dto.CartAddRequest;
import kr.remerge.stylehub.domain.cart.dto.CartResponse;
import kr.remerge.stylehub.domain.cart.service.CartService;
import kr.remerge.stylehub.global.auth.security.AuthUser;
import kr.remerge.stylehub.global.auth.security.CustomUserDetails;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<?> addItem(
            @LoginUser AuthUser authUser,
            @Valid @RequestBody CartAddRequest request
    ) {

        cartService.addToCart(authUser.userId(), request);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<?> getCart(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {

        List<CartResponse> cartItemList =  cartService.getCartByUserId(userDetails);

        return ResponseEntity.ok(cartItemList);
    }

}
