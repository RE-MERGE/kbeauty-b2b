// BuyerSourcingBoardResponse.java
package kr.remerge.stylehub.domain.sourcing.dto;

import java.util.List;

public record BuyerSourcingBoardResponse(
        List<BuyerSourcingResponse> requests,
        BuyerSourcingCountResponse counts
) {}