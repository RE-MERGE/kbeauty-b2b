package kr.remerge.stylehub.global.auth.dto.change;

import jakarta.validation.constraints.NotBlank;

public record VerifyChangeAuthRequest(
    @NotBlank(message = "인증 대상은 필수입니다.")
    String target,
    
    @NotBlank(message = "인증번호는 필수입니다.")
    String code
) {}