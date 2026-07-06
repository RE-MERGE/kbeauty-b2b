package kr.remerge.stylehub.domain.sourcing;

import kr.remerge.stylehub.domain.sourcing.dto.SupplierProfileResponse;
import kr.remerge.stylehub.domain.sourcing.dto.SupplierProfileUpdateRequest;
import kr.remerge.stylehub.domain.sourcing.service.SupplierProfileService;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 셀러(공급사) 소싱 수신 설정 — 프론트 BASE_URL: /api/sourcing/seller
 * 실제 매핑 경로가 기존 SellerSourcingController 등과 다르면 @RequestMapping 값만 맞춰주세요.
 */
@RestController
@RequestMapping("/api/sourcing/seller")
@RequiredArgsConstructor
public class SupplierProfileController {

    private final SupplierProfileService supplierProfileService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<SupplierProfileResponse>> getProfile(
            @LoginUser AuthUser authUser
    ) {
        SupplierProfileResponse response = supplierProfileService.getProfile(authUser.companyId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/profile")
    public ResponseEntity<ApiResponse<SupplierProfileResponse>> updateProfile(
            @LoginUser AuthUser authUser,
            @RequestBody SupplierProfileUpdateRequest request
    ) {
        // authUser.role()이 String이라 UserRole enum으로 변환 후 서비스에 전달
        UserRole role = UserRole.valueOf(authUser.role());
        SupplierProfileResponse response =
                supplierProfileService.updateProfile(authUser.companyId(), role, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}