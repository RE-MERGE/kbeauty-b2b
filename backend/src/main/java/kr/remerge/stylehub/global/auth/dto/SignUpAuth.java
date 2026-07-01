package kr.remerge.stylehub.global.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class SignUpAuth {

    public record EmailCheckRequest(
            @NotBlank(message = "이메일은 필수 입력 항목입니다.")
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            String email
    ) {
    }

    public record EmailSendRequest(
            @NotBlank(message = "이메일은 필수 입력 항목입니다.")
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            String email
    ) {
    }

    public record EmailVerifyRequest(
            @NotBlank(message = "이메일은 필수 입력 항목입니다.")
            @Email(message = "올바른 이메일 형식이 아닙니다.")
            String email,

            @NotBlank(message = "인증 코드는 필수입니다.")
            @Pattern(regexp = "^\\d{6}$", message = "인증번호는 6자리 숫자여야 합니다.")
            String code
    ) {
    }

    public record PhoneCheckRequest(
            @NotBlank(message = "핸드폰은 필수 입력 항목입니다.")
            @Pattern(regexp = "^\\d{10,11}$", message = "하이픈을 제외한 올바른 번호를 입력해주세요.")
            String phone
    ) {
    }

    public record PhoneSendRequest(
            @NotBlank(message = "휴대폰 번호는 필수 입력 항목입니다.")
            @Pattern(regexp = "^\\d{10,11}$", message = "하이픈을 제외한 올바른 번호를 입력해주세요.")
            String phone
    ) {
    }

    public record PhoneVerifyRequest(
            @NotBlank(message = "휴대폰 번호는 필수 입력 항목입니다.")
            @Pattern(regexp = "^\\d{10,11}$", message = "하이픈을 제외한 올바른 번호를 입력해주세요.")
            String phone,

            @NotBlank(message = "인증 코드는 필수입니다.")
            @Pattern(regexp = "^\\d{6}$", message = "인증번호는 6자리 숫자여야 합니다.")
            String code
    ) {
    }
}