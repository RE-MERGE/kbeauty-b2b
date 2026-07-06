package kr.remerge.stylehub.domain.negotiation.service;

import kr.remerge.stylehub.domain.negotiation.dto.NegotiationCreateRequest;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationListResponse;
import kr.remerge.stylehub.domain.negotiation.entity.Negotiation;
import kr.remerge.stylehub.domain.negotiation.entity.NegotiationRequest;
import kr.remerge.stylehub.domain.negotiation.repository.NegotiationRepository;
import kr.remerge.stylehub.domain.negotiation.repository.NegotiationRequestRepository;
import kr.remerge.stylehub.domain.quote.constant.QuoteStatusCode;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NegotiationService {

    private final NegotiationRepository negotiationRepository;
    private final NegotiationRequestRepository negotiationRequestRepository;
    private final QuoteRepository quoteRepository;
    private final UserReader userReader;

    public List<NegotiationListResponse> getNegotiationList(Integer userId) {

        List<Negotiation> negotiations =
                negotiationRepository
                        .findByBuyer_UserIdOrSeller_UserIdOrderByUpdatedAtDesc(
                                userId,
                                userId
                        );

        if (negotiations.isEmpty()) {
            return List.of();
        }

        List<Integer> negotiationIds = negotiations.stream()
                .map(Negotiation::getNegotiationId)
                .toList();

        Map<Integer, NegotiationRequest> latestRequestByNegotiationId =
                new HashMap<>();

        negotiationRequestRepository
                .findByNegotiation_NegotiationIdInOrderByCreatedAtDesc(
                        negotiationIds
                )
                .forEach(request ->
                        latestRequestByNegotiationId.putIfAbsent(
                                request.getNegotiation()
                                        .getNegotiationId(),
                                request
                        )
                );

        return negotiations.stream()
                .map(negotiation ->
                        NegotiationListResponse.from(
                                negotiation,
                                latestRequestByNegotiationId.get(
                                        negotiation.getNegotiationId()
                                )
                        )
                )
                .toList();

    }

    @Transactional
    public void createNegotiation(Integer userId, NegotiationCreateRequest request) {

        Quote quote =
                quoteRepository
                        .findByQuoteIdAndBuyer_UserId(request.quoteId(), userId)
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.QUOTE_NOT_FOUND)
                        );

        User buyer = userReader.getUser(userId);
        User seller = userReader.getUser(quote.getSeller().getUserId());

        Negotiation negotiation = negotiationRepository
                .findFirstByQuote_QuoteIdAndBuyer_UserIdAndStatusOrderByOpenedAtDesc(
                        request.quoteId(),
                        userId,
                        "OPEN"
                )
                .orElseGet(() ->
                        negotiationRepository.save(
                                new Negotiation(
                                        request.negotiationType().equals("QUOTE")
                                                ? "QUOTE" : "CONTRACT",
                                        quote,
                                        null,
                                        buyer,
                                        seller,
                                        quote.getProductName()
                                                + " 견적 조건 협의"
                                )
                        )
                );

        negotiationRequestRepository.save(
                new NegotiationRequest(
                        negotiation,
                        quote,
                        null,
                        request.content().trim()
                )
        );

        negotiation.markRequested();

        if (QuoteStatusCode.SUBMITTED.equals(quote.getStatus())) {
            quote.changeStatus(QuoteStatusCode.NEGOTIATING);
        }
    }
}
