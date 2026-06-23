package kr.remerge.stylehub.domain.sourcing.service;

import kr.remerge.stylehub.domain.sourcing.dto.SellerSourcingResponse;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingSupplier;
import kr.remerge.stylehub.domain.sourcing.enumtype.SourcingSupplierStatus;
import kr.remerge.stylehub.domain.sourcing.repository.SourcingSupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SellerSourcingService {

    private final SourcingSupplierRepository sourcingSupplierRepository;

    // TODO: 인증 붙으면 company_id를 SecurityContext에서 추출
    private static final Integer DUMMY_COMPANY_ID = 11;

    // current 탭: RECOMMENDED
    // my 탭: QUOTED
    @Transactional(readOnly = true)
    public List<SellerSourcingResponse> getSellerRequests(String type, SourcingSupplierStatus status) {
        return sourcingSupplierRepository
                .findSellerRequests(DUMMY_COMPANY_ID, status, type)
                .stream()
                .map(SellerSourcingResponse::from)
                .toList();
    }

    // past 탭: DECLINED + EXPIRED
    @Transactional(readOnly = true)
    public List<SellerSourcingResponse> getSellerPastRequests(String type) {
        return sourcingSupplierRepository
                .findSellerPastRequests(
                        DUMMY_COMPANY_ID,
                        List.of(SourcingSupplierStatus.DECLINED, SourcingSupplierStatus.EXPIRED),
                        type
                )
                .stream()
                .map(SellerSourcingResponse::from)
                .toList();
    }

    // 거절
    @Transactional
    public void decline(Integer sourcingSupplierId, String feedback) {
        SourcingSupplier supplier = sourcingSupplierRepository.findById(sourcingSupplierId)
                .orElseThrow(() -> new IllegalArgumentException("해당 배정 없음: " + sourcingSupplierId));

        // 본인 배정인지 확인
        if (!supplier.getSellerCompanyId().equals(DUMMY_COMPANY_ID)) {
            throw new IllegalArgumentException("권한 없음");
        }

        supplier.decline(feedback);
    }
}
