package kr.remerge.stylehub.domain.dispute.dto;

import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeType;
import kr.remerge.stylehub.domain.dispute.enumtype.RequestedAction;

import java.time.LocalDateTime;

public record DisputeListResponse(
        Integer disputeId,
        Integer orderId,
        String orderNo,
        String title,
        DisputeType disputeType,
        DisputeStatus status,
        RequestedAction requestedAction,
        String buyerClaim,
        LocalDateTime receivedAt
) {
    public static DisputeListResponse from(Dispute dispute) {
        return new DisputeListResponse(
                dispute.getDisputeId(),
                dispute.getOrder().getOrderId(),
                dispute.getOrder().getOrderNo(),
                dispute.getTitle(),
                dispute.getDisputeType(),
                dispute.getStatus(),
                dispute.getRequestedAction(),
                dispute.getBuyerClaim(),
                dispute.getReceivedAt()
        );
    }
}