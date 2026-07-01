package kr.remerge.stylehub.domain.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;

public record ProfileUpdateRequest(
    @Email(message = "올바른 이메일 형식이 아닙니다.")
    String email,

    @Pattern(regexp = "^010\\d{7,8}$", message = "올바른 휴대폰 번호 형식이 아닙니다.")
    String phone,

    String profileImageUrl // 프로필 이미지도 같이 변경한다면 포함
) {}