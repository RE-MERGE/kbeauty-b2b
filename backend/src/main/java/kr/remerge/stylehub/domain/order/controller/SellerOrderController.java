package kr.remerge.stylehub.domain.order.controller;


import kr.remerge.stylehub.domain.order.dto.seller.SellerOrderDetailResponse;
import kr.remerge.stylehub.domain.order.dto.seller.SellerOrderListResponse;
import kr.remerge.stylehub.domain.order.service.SellerOrderService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/seller/orders")
@RequiredArgsConstructor
public class SellerOrderController {

    private final SellerOrderService sellerOrderService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<SellerOrderListResponse>>> getOrderList(
            @LoginUser AuthUser authUser
            ) {

        List<SellerOrderListResponse> orderList = sellerOrderService.getSellerOrderList(authUser.userId());

        return ResponseEntity.ok(ApiResponse.success(orderList));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<SellerOrderDetailResponse>> getOrderDetail(
            @LoginUser AuthUser authUser,
            @PathVariable Integer orderId
    ) {

        SellerOrderDetailResponse responseList =
                sellerOrderService.getSellerOrderDetail(authUser.userId(), orderId);

        return ResponseEntity.ok(ApiResponse.success(responseList));
    }

    @PatchMapping("/items/{orderItemId}/ready")
    public ResponseEntity<ApiResponse<Void>> markReady(
            @LoginUser AuthUser authUser,
            @PathVariable Integer orderItemId
    ) {
        sellerOrderService.markOrderItemReady(
                authUser.userId(),
                orderItemId
        );

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{orderId}/items/ready")
    public ResponseEntity<ApiResponse<Void>> markAllItemsReady(
            @LoginUser AuthUser authUser,
            @PathVariable Integer orderId
    ) {
        sellerOrderService.markAllOrderItemsReady(
                authUser.userId(),
                orderId
        );

        return ResponseEntity.ok(ApiResponse.success(null));
    }

}
