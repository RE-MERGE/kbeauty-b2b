package kr.remerge.stylehub.domain.quote.service;

import kr.remerge.stylehub.domain.quote.dto.QuoteBuyerListResponse;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import kr.remerge.stylehub.domain.user.repository.UserRepository;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class QuoteBuyerService {

    private final QuoteRepository quoteRepository;
    private final UserRepository userRepository;

    public List<QuoteBuyerListResponse> getQuoteList(Integer userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return quoteRepository
                .findByBuyer_UserIdOrderBySubmittedAtDesc(userId)
                .stream()
                .map(QuoteBuyerListResponse::from)
                .toList();
    }
}
