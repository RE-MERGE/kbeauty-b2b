package kr.remerge.stylehub.domain.sourcing.service;

import kr.remerge.stylehub.domain.quote.constant.QuoteStatusCode;
import kr.remerge.stylehub.domain.sourcing.dto.SellerSourcingResponse;
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

import static reactor.netty.http.HttpConnectionLiveness.log;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellerSourcingService {

    private final SourcingSupplierRepository sourcingSupplierRepository;
    private final SourcingRequestRepository sourcingRequestRepository;
    private final SourcingAutoCancelService sourcingAutoCancelService;

    // current 탭: RECOMMENDED
    // my 탭: QUOTED
    @Transactional(readOnly = true)
    public List<SellerSourcingResponse> getSellerRequests(Integer companyId, String type, SourcingSupplierStatus status) {
        return sourcingSupplierRepository
                .findSellerRequests(companyId, status, type)
                .stream()
                .map(SellerSourcingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SellerSourcingResponse> getSellerPastRequests(Integer companyId, String type) {
        return sourcingSupplierRepository
                .findSellerPastRequests(
                        companyId,
                        List.of(SourcingSupplierStatus.DECLINED, SourcingSupplierStatus.EXPIRED,SourcingSupplierStatus.CANCELLED),
                        List.of(QuoteStatusCode.REJECTED, QuoteStatusCode.NOT_SELECTED),
                        type
                )
                .stream()
                .map(SellerSourcingResponse::from)
                .toList();
    }

    @Transactional
    public void decline(Integer sourcingSupplierId, Integer companyId, String feedback) {
        SourcingSupplier supplier = sourcingSupplierRepository.findById(sourcingSupplierId)
                .orElseThrow(() -> new IllegalArgumentException("해당 배정 없음: " + sourcingSupplierId));

        if (!supplier.getSellerCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("권한 없음");
        }

        supplier.decline(feedback);

        Integer sourcingRequestId = supplier.getSourcingRequest().getSourcingRequestId();
        sourcingAutoCancelService.checkAndAutoCancel(sourcingRequestId);
    }
    @Transactional(readOnly = true)
    public List<SellerSourcingResponse> getSellerCompletedRequests(Integer companyId, String type) {
        return sourcingSupplierRepository
                .findSellerCompletedRequests(companyId, QuoteStatusCode.APPROVED, type)
                .stream()
                .map(SellerSourcingResponse::from)
                .toList();
    }


}
