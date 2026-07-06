package kr.remerge.stylehub.domain.contract.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractDetailResponse;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractListResponse;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractPreviewRequest;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractSignRequest;
import kr.remerge.stylehub.domain.contract.service.BuyerContractService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buyer/contracts")
@RequiredArgsConstructor
public class BuyerContractController {

    private final BuyerContractService buyerContractService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<BuyerContractListResponse>>>
    getContracts(@LoginUser AuthUser authUser) {
        List<BuyerContractListResponse> response =
                buyerContractService.getContracts(authUser.userId());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{contractId}")
    public ResponseEntity<ApiResponse<BuyerContractDetailResponse>> getContract(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId
    ) {
        BuyerContractDetailResponse response =  buyerContractService.getContract(
                authUser.userId(),
                contractId
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(
            value = "/{contractId}/preview",
            produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> previewContract(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId,
            @Valid @RequestBody BuyerContractPreviewRequest request
    ) {
        byte[] pdfBytes = buyerContractService.previewContract(
                authUser.userId(),
                contractId,
                request
        );

        ContentDisposition disposition = ContentDisposition
                .inline()
                .filename("contract-preview-" + contractId + ".pdf")
                .build();

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        disposition.toString()
                )
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @PostMapping("/{contractId}/sign")
    public ResponseEntity<ApiResponse<Void>> signContract(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId,
            @Valid @RequestBody BuyerContractSignRequest request,
            HttpServletRequest httpRequest
    ) {
        buyerContractService.signContract(
                authUser.userId(),
                contractId,
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );

        return ResponseEntity.ok(ApiResponse.success());
    }
}
