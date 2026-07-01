package kr.remerge.stylehub.domain.quote.controller;

import kr.remerge.stylehub.domain.quote.dto.QuoteBuyerListResponse;
import kr.remerge.stylehub.domain.quote.service.QuoteBuyerService;
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
@RequestMapping("/api/buyer/quotes")
@RequiredArgsConstructor
public class QuoteBuyerController {

    private final QuoteBuyerService quoteBuyerService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<QuoteBuyerListResponse>>> getQuoteList(
            @LoginUser AuthUser authUser
    ) {
        List<QuoteBuyerListResponse> quotes =
                quoteBuyerService.getQuoteList(authUser.userId());

        return ResponseEntity.ok(ApiResponse.success(quotes));
    }

}
