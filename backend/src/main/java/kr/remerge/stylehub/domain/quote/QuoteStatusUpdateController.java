package kr.remerge.stylehub.domain.quote;

import kr.remerge.stylehub.domain.quote.dto.QuoteStatusUpdateRequest;
import kr.remerge.stylehub.domain.quote.service.QuoteStatusUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotes")
@RequiredArgsConstructor
public class QuoteStatusUpdateController {

    private final QuoteStatusUpdateService quoteStatusUpdateService;

    /**
     * 견적 상태 변경 (채택/거절/협의/샘플결제요청)
     * PATCH /api/quotes/{quoteId}/status
     * body: { "status": "APPROVED" | "REJECTED" | "NEGOTIATING" | "SAMPLE_REQUESTED" }
     */
    @PatchMapping("/{quoteId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable Integer quoteId,
            @RequestBody QuoteStatusUpdateRequest request
    ) {
        quoteStatusUpdateService.updateStatus(quoteId, request.getStatus());
        return ResponseEntity.ok().build();
    }
}
