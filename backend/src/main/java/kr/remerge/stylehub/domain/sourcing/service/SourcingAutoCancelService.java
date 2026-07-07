package kr.remerge.stylehub.domain.sourcing.service;

import kr.remerge.stylehub.domain.sourcing.entity.SourcingRequest;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingSupplier;
import kr.remerge.stylehub.domain.sourcing.enumtype.SourcingSupplierStatus;
import kr.remerge.stylehub.domain.sourcing.repository.SourcingRequestRepository;
import kr.remerge.stylehub.domain.sourcing.repository.SourcingSupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SourcingAutoCancelService {

    private final SourcingSupplierRepository sourcingSupplierRepository;
    private final SourcingRequestRepository sourcingRequestRepository;

    // 살아있는(진행 가능) 상태 — 이 중 하나라도 남아있으면 자동 반려하지 않음
    private static final List<SourcingSupplierStatus> ACTIVE_SUPPLIER_STATUSES = List.of(
            SourcingSupplierStatus.SUGGESTED,
            SourcingSupplierStatus.RECOMMENDED,
            SourcingSupplierStatus.QUOTED
    );

    /**
     * 해당 소싱 요청의 모든 supplier가 거절/만료/취소 등으로
     * 더 이상 진행 가능한 상태가 아니면 sourcingRequest를 자동 반려(cancel) 처리한다.
     * decline(셀러), reject(관리자) 등 supplier 상태 변경 직후 호출.
     */
    @Transactional
    public void checkAndAutoCancel(Integer sourcingRequestId) {
        List<SourcingSupplier> allSuppliers = sourcingSupplierRepository
                .findAllBySourcingRequest_SourcingRequestId(sourcingRequestId);

        if (allSuppliers.isEmpty()) {
            return;
        }

        boolean anyActive = allSuppliers.stream()
                .anyMatch(s -> ACTIVE_SUPPLIER_STATUSES.contains(s.getStatus()));

        if (anyActive) {
            return;
        }

        SourcingRequest sourcingRequest = sourcingRequestRepository.findById(sourcingRequestId)
                .orElseThrow(() -> new IllegalArgumentException("소싱 요청 없음: " + sourcingRequestId));

        sourcingRequest.cancel();
        log.info("[AutoCancel] 모든 공급사 거절/만료 → 소싱 요청 반려 처리 - sourcingRequestId: {}", sourcingRequestId);
    }
}