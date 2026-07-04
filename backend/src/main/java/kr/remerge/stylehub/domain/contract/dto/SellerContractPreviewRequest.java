package kr.remerge.stylehub.domain.contract.dto;

import jakarta.validation.constraints.Size;

public record SellerContractPreviewRequest(

        @Size(max = 100, message = "서명자명은 100자 이하여야 합니다.")
        String signatureText,

        @Size(max = 2000, message = "서명 이미지 URL은 2000자 이하여야 합니다.")
        String signatureImageUrl
) {

    public boolean hasSignature() {
        return signatureText != null
                && !signatureText.isBlank()
                && signatureImageUrl != null
                && !signatureImageUrl.isBlank();
    }
}
