package kr.remerge.stylehub.domain.settlement;

import kr.remerge.stylehub.domain.settlement.dto.SettlementDto;
import kr.remerge.stylehub.domain.settlement.entity.Settlement;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettlementService {

    private final SettlementRepository settlementRepository;

    @Transactional
    public void saveSettlement(SettlementDto settlementDto) {

        // 3. Repository를 통해 DB에 저장
    }
}