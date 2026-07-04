package kr.remerge.stylehub.domain.negotiation.service;

import kr.remerge.stylehub.domain.negotiation.dto.NegotiationCreateRequest;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationCreateResponse;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationListResponse;
import kr.remerge.stylehub.domain.negotiation.repository.NegotiationRepository;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;
import kr.remerge.stylehub.domain.quote.repository.QuoteItemRepository;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.repository.UserRepository;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NegotiationService {

    private final NegotiationRepository negotiationRepository;
    private final QuoteRepository quoteRepository;
    private final QuoteItemRepository quoteItemRepository;
    private final UserReader userReader;

    public List<NegotiationListResponse> getNegotiationList(Integer userId) {

        return negotiationRepository.findByBuyer_UserIdOrSeller_UserId(userId, userId)
                .stream()
                .map(NegotiationListResponse::from)
                .toList();

    }

    @Transactional
    public void createNegotiation(Integer userId, Integer quoteId, NegotiationCreateRequest request) {

        Quote quote =
                quoteRepository
                        .findByQuoteIdAndBuyer_UserId(quoteId, userId)
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.QUOTE_NOT_FOUND)
                        );

        User buyer = userReader.getUser(userId);
        User seller = userReader.getUser(quote.getSeller().getUserId());


    }
}
