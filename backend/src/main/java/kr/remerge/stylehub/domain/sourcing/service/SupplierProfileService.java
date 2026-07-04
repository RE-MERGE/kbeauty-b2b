package kr.remerge.stylehub.domain.sourcing.service;

import kr.remerge.stylehub.domain.sourcing.dto.SupplierProfileResponse;
import kr.remerge.stylehub.domain.sourcing.dto.SupplierProfileUpdateRequest;
import kr.remerge.stylehub.domain.sourcing.entity.SupplierProfile;
import kr.remerge.stylehub.domain.sourcing.repository.SupplierProfileRepository;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SupplierProfileService {

    private final SupplierProfileRepository supplierProfileRepository;

    // 조회는 회사 소속이면 누구나 (직원도 회사 소싱 수신 설정 확인 가능해야 함)
    // 아직 설정한 적 없는 셀러는 프로필 행 자체가 없을 수 있음 -> 기본값(NONE, 자동배정 OFF)으로 응답
    @Transactional(readOnly = true)
    public SupplierProfileResponse getProfile(Integer companyId) {
        SupplierProfile profile = supplierProfileRepository.findById(companyId)
                .orElseGet(() -> SupplierProfile.createDefault(companyId));
        return SupplierProfileResponse.from(profile);
    }

    // 변경(액션)은 회사 전체 자동배정 정책에 영향을 주므로 대표만 허용
    @Transactional
    public SupplierProfileResponse updateProfile(Integer companyId, UserRole role, SupplierProfileUpdateRequest request) {
        if (role != UserRole.PRESIDENT) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        SupplierProfile profile = supplierProfileRepository.findById(companyId)
                .orElseGet(() -> SupplierProfile.createDefault(companyId));

        profile.changeSourcingType(request.getSourcingType());
        profile.toggleAutoAssign(request.isAutoAssignEnabled());

        SupplierProfile saved = supplierProfileRepository.save(profile);
        return SupplierProfileResponse.from(saved);
    }
}