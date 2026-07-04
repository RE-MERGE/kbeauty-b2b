package kr.remerge.stylehub.domain.company.dto.response;

import kr.remerge.stylehub.domain.company.entity.Company;

public record CompanyResponse(
        Integer companyId,
        String companyName
) {
    // 엔티티를 DTO로 변환하는 static 팩토리 메서드
    public static CompanyResponse from(Company company) {
        return new CompanyResponse(company.getCompanyId(), company.getName());
    }
}