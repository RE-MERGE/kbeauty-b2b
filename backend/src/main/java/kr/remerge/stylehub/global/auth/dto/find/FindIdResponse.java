package kr.remerge.stylehub.global.auth.dto.find;

public record FindIdResponse(
    String maskedEmail,
    String createdAt
) {}