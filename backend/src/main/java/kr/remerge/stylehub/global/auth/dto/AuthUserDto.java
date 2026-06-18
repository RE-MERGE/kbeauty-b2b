package kr.remerge.stylehub.global.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AuthUserDto {
    private final Integer userId;
    private final Integer companyId;
    private final String role;
    private final String businessRole;
}