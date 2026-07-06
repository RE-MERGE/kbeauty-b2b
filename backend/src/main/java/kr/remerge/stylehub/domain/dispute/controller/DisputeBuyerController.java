package kr.remerge.stylehub.domain.dispute.controller;

import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.dispute.dto.*;
import kr.remerge.stylehub.domain.dispute.service.DisputeResponseService;
import kr.remerge.stylehub.domain.dispute.service.DisputeService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buyer/orders")
@RequiredArgsConstructor
public class DisputeBuyerController {

    private final DisputeService disputeService;
    private final DisputeResponseService disputeResponseService;

    @PostMapping("/{orderId}/disputes")
    public ResponseEntity<ApiResponse<DisputeCreateResponse>>
    createDispute(
            @LoginUser AuthUser authUser,
            @PathVariable Integer orderId,
            @Valid @RequestBody DisputeCreateRequest request
    ) {
        DisputeCreateResponse response =
                disputeService.createDispute(
                        authUser.userId(),
                        orderId,
                        request
                );

        return ResponseEntity.ok(ApiResponse.success(response)
        );
    }

    @GetMapping("/disputes")
    public ResponseEntity<ApiResponse<List<DisputeListResponse>>> getDisputes(
            @LoginUser AuthUser authUser
    ) {

        List<DisputeListResponse> disputes =
                disputeService.getBuyerDisputes(authUser.userId());

        return ResponseEntity.ok(ApiResponse.success(disputes));
    }

    @GetMapping("/disputes/{disputeId}")
    public ResponseEntity<ApiResponse<DisputeDetailResponse>>
    getDisputeDetail(
            @LoginUser AuthUser authUser,
            @PathVariable Integer disputeId
    ) {
        DisputeDetailResponse response =
                disputeResponseService.getBuyerDetail(
                        authUser.userId(),
                        disputeId
                );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/disputes/{disputeId}/responses")
    public ResponseEntity<ApiResponse<DisputeResponseItemResponse>>
    createResponse(
            @LoginUser AuthUser authUser,
            @PathVariable Integer disputeId,
            @Valid @RequestBody
            DisputeResponseCreateRequest request
    ) {
        DisputeResponseItemResponse response =
                disputeResponseService.createBuyerResponse(
                        authUser.userId(),
                        disputeId,
                        request
                );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/disputes/{disputeId}/resolve")
    public ResponseEntity<ApiResponse<Void>> resolveDispute(
            @LoginUser AuthUser authUser,
            @PathVariable Integer disputeId
    ) {
        disputeService.resolveByBuyer(
                authUser.userId(),
                disputeId
        );

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/disputes/{disputeId}/admin-review")
    public ResponseEntity<ApiResponse<Void>> requestAdminReview(
            @LoginUser AuthUser authUser,
            @PathVariable Integer disputeId
    ) {
        disputeService.requestAdminReview(
                authUser.userId(),
                disputeId
        );

        return ResponseEntity.ok(ApiResponse.success(null));
    }
}