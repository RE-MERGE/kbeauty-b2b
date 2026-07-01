package kr.remerge.stylehub.domain.user.dto.response;

import kr.remerge.stylehub.domain.user.entity.User;

public record ProfileUpdateResponse(
    Integer userId,
    String email,
    String phone,
    String profileImageUrl
) {
    /**
     * 엔티티를 받아 DTO로 빠르게 변환하는 팩토리 메서드
     */
    public static ProfileUpdateResponse from(User user) {
        return new ProfileUpdateResponse(
                user.getUserId(),
                user.getEmail(),
                user.getPhone(),
                user.getProfileImageUrl()
        );
    }
}