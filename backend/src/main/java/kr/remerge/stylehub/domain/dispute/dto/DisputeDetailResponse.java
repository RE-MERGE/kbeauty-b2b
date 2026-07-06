package kr.remerge.stylehub.domain.dispute.dto;

import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.entity.DisputeResponse;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeType;
import kr.remerge.stylehub.domain.dispute.enumtype.RequestedAction;

import java.time.LocalDateTime;
import java.util.List;

public record DisputeDetailResponse(
        Integer disputeId,
        Integer orderId,
        String orderNo,
        String title,
        DisputeType disputeType,
        DisputeStatus status,
        RequestedAction requestedAction,
        String buyerClaim,
        LocalDateTime receivedAt,
        List<DisputeResponseItemResponse> responses
) {
    public static DisputeDetailResponse from(
            Dispute dispute,
            List<DisputeResponse> responses
    ) {
        return new DisputeDetailResponse(
                dispute.getDisputeId(),
                dispute.getOrder().getOrderId(),
                dispute.getOrder().getOrderNo(),
                dispute.getTitle(),
                dispute.getDisputeType(),
                dispute.getStatus(),
                dispute.getRequestedAction(),
                dispute.getBuyerClaim(),
                dispute.getReceivedAt(),
                responses.stream()
                        .map(DisputeResponseItemResponse::from)
                        .toList()
        );
    }
}