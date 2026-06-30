package kr.remerge.stylehub.domain.sourcing.service;

import kr.remerge.stylehub.domain.sourcing.dto.SourcingRequestSellerDetailResponse;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingRequest;
import kr.remerge.stylehub.domain.sourcing.repository.SourcingRequestFileRepository;
import kr.remerge.stylehub.domain.sourcing.repository.SourcingRequestItemRepository;
import kr.remerge.stylehub.domain.sourcing.repository.SourcingRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SourcingRequestSellerDetailService {

    private final SourcingRequestRepository sourcingRequestRepository;
    private final SourcingRequestItemRepository sourcingRequestItemRepository;
    private final SourcingRequestFileRepository sourcingRequestFileRepository;

    @Transactional(readOnly = true)
    public SourcingRequestSellerDetailResponse getSellerSourcingDetail(Integer sourcingRequestId) {
        SourcingRequest request = sourcingRequestRepository.findById(sourcingRequestId)
                .orElseThrow(() -> new IllegalArgumentException("소싱 요청을 찾을 수 없습니다."));

        return SourcingRequestSellerDetailResponse.from(
                request,
                sourcingRequestItemRepository.findBySourcingRequest_SourcingRequestId(sourcingRequestId),
                sourcingRequestFileRepository.findBySourcingRequest_SourcingRequestId(sourcingRequestId)
        );
    }
}
