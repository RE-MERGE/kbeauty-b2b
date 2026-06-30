package kr.remerge.stylehub.domain.quote;

import kr.remerge.stylehub.domain.quote.dto.QuoteCreateRequest;
import kr.remerge.stylehub.domain.quote.dto.QuoteCreateResponse;
import kr.remerge.stylehub.domain.quote.dto.QuoteInitResponse;
import kr.remerge.stylehub.domain.quote.service.QuoteCreateService;
import kr.remerge.stylehub.domain.quote.service.QuoteInitService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class QuoteController {

    private final QuoteInitService quoteInitService;
    private final QuoteCreateService quoteCreateService;

    /**
     * 셀러 견적 작성 화면 진입 시 소싱 요청 기본 정보 조회
     * GET /api/sourcing-requests/{sourcingId}/quote-init
     */
    @GetMapping("/api/sourcing-requests/{sourcingId}/quote-init")
    public ResponseEntity<QuoteInitResponse> getQuoteInit(@PathVariable Integer sourcingId) {
        return ResponseEntity.ok(quoteInitService.getQuoteInit(sourcingId));
    }

    /**
     * 견적서 저장
     * POST /api/quotes
     * Response: QuoteCreateResponse (QuoteDetail 페이지에서 location.state로 사용)
     */
    @PostMapping("/api/quotes")
    public ResponseEntity<QuoteCreateResponse> createQuote(@RequestBody QuoteCreateRequest request) {
        return ResponseEntity.ok(quoteCreateService.createQuote(request));
    }
}
