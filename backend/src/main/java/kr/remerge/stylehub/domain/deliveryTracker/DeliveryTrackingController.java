package kr.remerge.stylehub.domain.deliveryTracker;

import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.deliveryTracker.dto.DeliveryRegisterRequest;
import kr.remerge.stylehub.domain.deliveryTracker.dto.DeliveryTrackingResponse;
import kr.remerge.stylehub.domain.deliveryTracker.service.DeliveryTrackingStatusService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/delivery")
@RequiredArgsConstructor
public class DeliveryTrackingController {

    private final DeliveryTrackingStatusService deliveryTrackingStatusService;

    // 셀러가 운송장 등록
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @LoginUser AuthUser authUser,
            @Valid @RequestBody DeliveryRegisterRequest request
    ) {
        deliveryTrackingStatusService.register(authUser.companyId(), request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 배송 현황 조회 (바이어/셀러 모두 가능)
    @GetMapping("/track/{orderId}")
    public ResponseEntity<ApiResponse<DeliveryTrackingResponse.TrackingResult>> track(
            @LoginUser AuthUser authUser,
            @PathVariable Integer orderId
    ) {
        DeliveryTrackingResponse.TrackingResult result =
                deliveryTrackingStatusService.track(orderId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}
