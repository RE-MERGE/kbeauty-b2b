// BuyerSourcingController.java
package kr.remerge.stylehub.domain.sourcing;

import kr.remerge.stylehub.domain.sourcing.dto.BuyerSourcingBoardResponse;
import kr.remerge.stylehub.domain.sourcing.service.BuyerSourcingService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sourcing/buyer")
@RequiredArgsConstructor
public class BuyerSourcingController {

    private final BuyerSourcingService buyerSourcingService;

    @GetMapping("/requests")
    public ResponseEntity<BuyerSourcingBoardResponse> getBuyerRequests(
            @RequestParam String type,
            @RequestParam(required = false) String status,
            @LoginUser AuthUser user
    ) {
        Integer buyerCompanyId = user.companyId();
        return ResponseEntity.ok(buyerSourcingService.getBuyerSourcingBoard(buyerCompanyId, type, status));
    }

    @PatchMapping("/requests/{sourcingRequestId}/withdraw")
    public ResponseEntity<Void> withdraw(@PathVariable Integer sourcingRequestId) {
        buyerSourcingService.withdraw(sourcingRequestId);
        return ResponseEntity.ok().build();
    }
}