package kr.remerge.stylehub.domain.company.dto.response;

import kr.remerge.stylehub.domain.user.entity.User;

public record EmployeeResponse(
        Integer userId,
        String name
) {
    public static EmployeeResponse from(User user) {
        return new EmployeeResponse(user.getUserId(), user.getName());
    }
}