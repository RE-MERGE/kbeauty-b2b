package kr.remerge.stylehub.global.auth.dto.login;


import java.io.Serializable;

public record AuthUser(
        Integer userId,
        Integer companyId,
        String role,
        String businessRole
) implements Serializable {
    private static final long serialVersionUID = 1L;
}
