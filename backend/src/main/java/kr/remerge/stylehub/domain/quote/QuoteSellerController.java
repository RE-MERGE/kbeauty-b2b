package kr.remerge.stylehub.domain.quote;

import kr.remerge.stylehub.domain.quote.dto.QuoteSellerListResponse;
import kr.remerge.stylehub.domain.quote.service.QuoteSellerListService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes/seller")
@RequiredArgsConstructor
public class QuoteSellerController {

    private final QuoteSellerListService quoteSellerListService;

    /**
     * 셀러 본인이 특정 소싱 요청에 제출한 견적 목록 조회
     * GET /api/quotes/seller?sourcingRequestId=1
     */
    @GetMapping
    public ResponseEntity<List<QuoteSellerListResponse>> getMyQuotes(
            @RequestParam Integer sourcingRequestId) {
        return ResponseEntity.ok(quoteSellerListService.getMyQuotes(sourcingRequestId));
    }
}
