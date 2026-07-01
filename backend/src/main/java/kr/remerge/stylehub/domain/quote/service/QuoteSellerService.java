package kr.remerge.stylehub.domain.quote.service;

import kr.remerge.stylehub.domain.quote.dto.QuoteSellerListResponse;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;
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
public class QuoteSellerService {

    private final QuoteRepository quoteRepository;
    private final UserRepository userRepository;

    public List<QuoteSellerListResponse> getQuoteList(Integer userId) {

        User seller = findUser(userId);

        List<Quote> quotes;

        if (seller.getRole() == UserRole.PRESIDENT) {
            quotes =quoteRepository
                    .findByCompany_CompanyIdOrderBySubmittedAtDesc(
                            seller.getCompany().getCompanyId()
                    );
        } else if (seller.getRole() == UserRole.EMPLOYEE) {
            quotes = quoteRepository
                    .findBySeller_UserIdOrderBySubmittedAtDesc(userId);
        } else {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return quotes.stream()
                .map(QuoteSellerListResponse::from)
                .toList();

    }

    private User findUser(Integer userId) {
        User seller = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        if (seller.getCompany() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return seller;
    }


}
