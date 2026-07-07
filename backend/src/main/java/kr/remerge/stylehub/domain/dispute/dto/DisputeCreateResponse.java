package kr.remerge.stylehub.domain.dispute.dto;

import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;

public record DisputeCreateResponse(
        Integer disputeId,
        DisputeStatus status
) {

    public static DisputeCreateResponse from(Dispute dispute) {

        return new DisputeCreateResponse(
                dispute.getDisputeId(),
                dispute.getStatus()
        );
    }
}
