package kr.remerge.stylehub.domain.sourcing;

import kr.remerge.stylehub.domain.sourcing.dto.SellerDeclineRequest;
import kr.remerge.stylehub.domain.sourcing.dto.SellerSourcingResponse;
import kr.remerge.stylehub.domain.sourcing.dto.SourcingRequestSellerDetailResponse;
import kr.remerge.stylehub.domain.sourcing.enumtype.SourcingSupplierStatus;
import kr.remerge.stylehub.domain.sourcing.service.SellerSourcingService;
import kr.remerge.stylehub.domain.sourcing.service.SourcingRequestSellerDetailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sourcing/seller")
@RequiredArgsConstructor
public class SellerSourcingController {

    private final SellerSourcingService sellerSourcingService;
    private final SourcingRequestSellerDetailService sourcingRequestSellerDetailService;

    // current: RECOMMENDED / my: QUOTED
    @GetMapping("/requests")
    public ResponseEntity<List<SellerSourcingResponse>> getSellerRequests(
            @RequestParam String type,
            @RequestParam(defaultValue = "RECOMMENDED") SourcingSupplierStatus status
    ) {
        return ResponseEntity.ok(sellerSourcingService.getSellerRequests(type, status));
    }

    // past: DECLINED + EXPIRED
    @GetMapping("/requests/past")
    public ResponseEntity<List<SellerSourcingResponse>> getSellerPastRequests(
            @RequestParam String type
    ) {
        return ResponseEntity.ok(sellerSourcingService.getSellerPastRequests(type));
    }

    // 셀러용 소싱 요청 상세 조회 (다른 회사 견적은 포함하지 않음)
    @GetMapping("/requests/{sourcingRequestId}")
    public ResponseEntity<SourcingRequestSellerDetailResponse> getSellerSourcingDetail(
            @PathVariable Integer sourcingRequestId
    ) {
        return ResponseEntity.ok(
                sourcingRequestSellerDetailService.getSellerSourcingDetail(sourcingRequestId));
    }

    // 거절
    @PatchMapping("/suppliers/{sourcingSupplierId}/decline")
    public ResponseEntity<Void> decline(
            @PathVariable Integer sourcingSupplierId,
            @RequestBody SellerDeclineRequest request
    ) {
        sellerSourcingService.decline(sourcingSupplierId, request.getFeedback());
        return ResponseEntity.ok().build();
    }
}
