package kr.remerge.stylehub.domain.company.dto.response;

import kr.remerge.stylehub.domain.company.enumtype.SellerStatus;

public record CompanyLookupResponse(
        String companyName,
        String representativeName,
        SellerStatus sellerStatus
) {
}