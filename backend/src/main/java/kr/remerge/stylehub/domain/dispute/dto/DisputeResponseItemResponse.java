package kr.remerge.stylehub.domain.dispute.dto;

import kr.remerge.stylehub.domain.dispute.entity.DisputeResponse;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;
import kr.remerge.stylehub.domain.dispute.enumtype.ResponderRole;

import java.time.LocalDateTime;

public record DisputeResponseItemResponse(
        Integer responseId,
        ResponderRole responderRole,
        DisputeStatus status,
        String content,
        LocalDateTime createdAt
) {
    public static DisputeResponseItemResponse from(
            DisputeResponse response
    ) {
        return new DisputeResponseItemResponse(
                response.getDisputeResponseId(),
                response.getResponderRole(),
                response.getStatus(),
                response.getContent(),
                response.getCreatedAt()
        );
    }
}