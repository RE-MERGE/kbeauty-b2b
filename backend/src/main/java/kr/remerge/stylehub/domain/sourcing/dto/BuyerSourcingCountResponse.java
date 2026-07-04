// BuyerSourcingCountResponse.java
package kr.remerge.stylehub.domain.sourcing.dto;

public record BuyerSourcingCountResponse(
        int all, int active, int trading, int completed, int closed
) {}