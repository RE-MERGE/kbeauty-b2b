package kr.remerge.stylehub.domain.sourcing;

import kr.remerge.stylehub.domain.sourcing.dto.AdminManualAssignRequest;
import kr.remerge.stylehub.domain.sourcing.dto.SourcingSupplierApproveRequest;
import kr.remerge.stylehub.domain.sourcing.dto.SourcingSupplierResponse;
import kr.remerge.stylehub.domain.sourcing.service.SourcingAdminService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/sourcing")
@RequiredArgsConstructor
public class SourcingAdminController {

    private final SourcingAdminService sourcingAdminService;

    // SUGGESTED 상태 공급사 목록 조회 (관리자 승인 대기 목록)
    @GetMapping("/{sourcingRequestId}/suppliers/suggested")
    public ResponseEntity<ApiResponse<List<SourcingSupplierResponse>>> getSuggestedSuppliers(
            @LoginUser AuthUser authUser,
            @PathVariable Integer sourcingRequestId
    ) {
        List<SourcingSupplierResponse> response =
                sourcingAdminService.getSuggestedSuppliers(sourcingRequestId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 관리자 승인 → RECOMMENDED
    @PatchMapping("/suppliers/{sourcingSupplierId}/approve")
    public ResponseEntity<ApiResponse<Void>> approve(
            @LoginUser AuthUser authUser,
            @PathVariable Integer sourcingSupplierId
    ) {
        sourcingAdminService.approve(sourcingSupplierId, authUser.userId());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 배정 안 된 소싱 요청 목록 조회
    @GetMapping("/unassigned")
    public ResponseEntity<ApiResponse<List<SourcingSupplierResponse>>> getUnassignedRequests(
            @LoginUser AuthUser authUser
    ) {
        List<SourcingSupplierResponse> response =
                sourcingAdminService.getUnassignedRequests();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // 수동 배정 → SUGGESTED로 추가
    @PostMapping("/{sourcingRequestId}/suppliers")
    public ResponseEntity<ApiResponse<Void>> manualAssign(
            @LoginUser AuthUser authUser,
            @PathVariable Integer sourcingRequestId,
            @RequestParam Integer companyId
    ) {
        sourcingAdminService.manualAssign(sourcingRequestId, companyId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}