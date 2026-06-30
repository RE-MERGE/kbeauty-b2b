package kr.remerge.stylehub.domain.quote;

import kr.remerge.stylehub.domain.quote.dto.QuoteCreateResponse;
import kr.remerge.stylehub.domain.quote.service.QuoteGetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteGetController {

    private final QuoteGetService quoteGetService;

    /**
     * 견적 단건 조회 (QuoteDetail 새로고침/직접 진입 시 사용)
     * GET /api/quotes/{quoteId}
     */
    @GetMapping("/{quoteId}")
    public ResponseEntity<QuoteCreateResponse> getQuote(@PathVariable Integer quoteId) {
        return ResponseEntity.ok(quoteGetService.getQuote(quoteId));
    }
}
