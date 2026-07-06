package kr.remerge.stylehub.domain.negotiation.dto;

import kr.remerge.stylehub.domain.negotiation.entity.Negotiation;
import kr.remerge.stylehub.domain.negotiation.entity.NegotiationRequest;

import java.time.LocalDateTime;

public record NegotiationListResponse(

        Integer negotiationId,
        String negotiationType,
        Integer quoteId,
        String quoteNo,
        String productName,
        String buyerName,
        String sellerName,
        String adminName,
        String status,
        String title,
        String latestRequest,
        LocalDateTime openedAt,
        LocalDateTime updatedAt,
        LocalDateTime agreedAt,
        LocalDateTime closedAt
) {

    public static NegotiationListResponse from(
            Negotiation negotiation,
            NegotiationRequest latestRequest
    ) {

        return new NegotiationListResponse(
                negotiation.getNegotiationId(),
                negotiation.getNegotiationType(),
                negotiation.getQuote() == null
                        ? null
                        : negotiation.getQuote().getQuoteId(),
                negotiation.getQuote() == null
                        ? null
                        : negotiation.getQuote().getQuoteNo(),
                negotiation.getQuote() == null
                        ? null
                        : negotiation.getQuote().getProductName(),
                negotiation.getBuyer().getName(),
                negotiation.getSeller().getName(),
                negotiation.getAdmin() == null
                        ? null
                        : negotiation.getAdmin().getName(),
                negotiation.getStatus(),
                negotiation.getTitle(),
                latestRequest == null
                        ? null
                        : latestRequest.getBuyerRequest(),
                negotiation.getOpenedAt(),
                negotiation.getUpdatedAt(),
                negotiation.getAgreedAt(),
                negotiation.getClosedAt()
        );
    }
}
