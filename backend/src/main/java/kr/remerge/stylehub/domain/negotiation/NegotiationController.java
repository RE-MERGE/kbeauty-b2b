package kr.remerge.stylehub.domain.negotiation;

import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationCreateRequest;
import kr.remerge.stylehub.domain.negotiation.dto.NegotiationListResponse;
import kr.remerge.stylehub.domain.negotiation.service.NegotiationService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/negotiations")
public class NegotiationController {

    private final NegotiationService negotiationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NegotiationListResponse>>> getNegotiationList(
            @LoginUser AuthUser authUser
    ) {

        List<NegotiationListResponse> responses =
                negotiationService.getNegotiationList(authUser.userId());

        return ResponseEntity.ok(ApiResponse.success(responses));

    }

    @PostMapping()
    public ResponseEntity<ApiResponse<Void>> createNegotiation(
            @LoginUser AuthUser authUser,
            @Valid @RequestBody NegotiationCreateRequest request
    ) {

        negotiationService.createNegotiation(authUser.userId(), request);

        return ResponseEntity.ok(ApiResponse.success(null));

    }

}
