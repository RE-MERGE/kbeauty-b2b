package kr.remerge.stylehub.domain.contract.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import kr.remerge.stylehub.domain.contract.dto.*;
import kr.remerge.stylehub.domain.contract.service.SellerContractService;
import kr.remerge.stylehub.global.auth.dto.login.AuthUser;
import kr.remerge.stylehub.global.auth.security.LoginUser;
import kr.remerge.stylehub.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller/contracts")
@RequiredArgsConstructor
public class SellerContractController {

    private final SellerContractService sellerContractService;

    @PostMapping
    public ResponseEntity<ApiResponse<SellerContractCreateResponse>> createContract(
            @LoginUser AuthUser authUser,
            @Valid @RequestBody SellerContractCreateRequest request
    ) {

        SellerContractCreateResponse response = sellerContractService.createContract(
                authUser.userId(),
                request
        );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/quotes/{quoteId}")
    public ResponseEntity<ApiResponse<SellerContractDetailResponse>> getContractByQuote(
            @LoginUser AuthUser authUser,
            @PathVariable Integer quoteId
    ) {

        SellerContractDetailResponse response =
                sellerContractService.getContractByQuote(
                        authUser.userId(),
                        quoteId
                );

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/{contractId}/sign")
    public ResponseEntity<ApiResponse<Void>> signAndSend(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId,
            @Valid @RequestBody SellerContractSignRequest request,
            HttpServletRequest httpRequest
    ) {
        sellerContractService.signAndSend(
                authUser.userId(),
                contractId,
                request,
                httpRequest.getRemoteAddr(),
                httpRequest.getHeader("User-Agent")
        );

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PatchMapping("/{contractId}")
    public ResponseEntity<ApiResponse<Void>> updateDraft(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId,
            @Valid @RequestBody SellerContractUpdateRequest request
    ) {

        sellerContractService.updateDraft(
                authUser.userId(),
                contractId,
                request
        );

        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/{contractId}/preview")
    public ResponseEntity<byte[]> previewContract(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId
    ) {

        byte[] pdfBytes =
                sellerContractService.getContractPreview(
                        authUser.userId(),
                        contractId
                );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(
                                        "contract-preview-"
                                                + contractId
                                                + ".pdf"
                                )
                                .build()
                                .toString()
                )
                .body(pdfBytes);
    }

    @PostMapping("/{contractId}/preview")
    public ResponseEntity<byte[]> previewContractWithSignature(
            @LoginUser AuthUser authUser,
            @PathVariable Integer contractId,
            @Valid @RequestBody SellerContractPreviewRequest request
    ) {

        byte[] pdfBytes =
                sellerContractService.getContractPreview(
                        authUser.userId(),
                        contractId,
                        request
                );

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline()
                                .filename(
                                        "contract-preview-"
                                                + contractId
                                                + ".pdf"
                                )
                                .build()
                                .toString()
                )
                .body(pdfBytes);
    }
}
