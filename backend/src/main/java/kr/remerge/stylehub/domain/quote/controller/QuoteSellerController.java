package kr.remerge.stylehub.domain.quote.controller;

import kr.remerge.stylehub.domain.quote.dto.QuoteSellerListResponse;
import kr.remerge.stylehub.domain.quote.service.QuoteSellerService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seller/quotes")
@RequiredArgsConstructor
public class QuoteSellerController {

    private final QuoteSellerService quoteSellerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuoteSellerListResponse>>> getQuoteList(
            @LoginUser AuthUser authUser
    ) {
        List<QuoteSellerListResponse> quotes =
                quoteSellerService.getQuoteList(authUser.userId());

        return ResponseEntity.ok(ApiResponse.success(quotes));
    }
}
