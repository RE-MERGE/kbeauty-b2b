package kr.remerge.stylehub.domain.contract.service;

import kr.remerge.stylehub.domain.contract.dto.BuyerContractDetailResponse;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractListResponse;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractPreviewRequest;
import kr.remerge.stylehub.domain.contract.dto.BuyerContractSignRequest;
import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.entity.ContractItem;
import kr.remerge.stylehub.domain.contract.entity.ContractSignature;
import kr.remerge.stylehub.domain.contract.enumtype.ContractStatus;
import kr.remerge.stylehub.domain.contract.enumtype.SignerRole;
import kr.remerge.stylehub.domain.contract.pdf.ContractPdfGenerator;
import kr.remerge.stylehub.domain.contract.repository.ContractItemRepository;
import kr.remerge.stylehub.domain.contract.repository.ContractRepository;
import kr.remerge.stylehub.domain.contract.repository.ContractSignatureRepository;
import kr.remerge.stylehub.domain.contract.support.ContractHashGenerator;
import kr.remerge.stylehub.domain.order.entity.OrderLog;
import kr.remerge.stylehub.domain.order.enumtype.OrderProcessStep;
import kr.remerge.stylehub.domain.order.repository.OrderLogRepository;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.common.ImageUploadService;
import kr.remerge.stylehub.global.common.hash.Sha256HashGenerator;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BuyerContractService {

    private final ContractRepository contractRepository;
    private final ContractItemRepository contractItemRepository;
    private final ContractSignatureRepository contractSignatureRepository;
    private final UserReader userReader;
    private final ContractHashGenerator contractHashGenerator;
    private final ContractPdfGenerator contractPdfGenerator;
    private final Sha256HashGenerator sha256HashGenerator;
    private final ImageUploadService imageUploadService;
    private final OrderRepository orderRepository;
    private final OrderLogRepository orderLogRepository;

    public List<BuyerContractListResponse> getContracts(Integer userId) {
        return contractRepository
                .findByQuote_Buyer_UserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BuyerContractListResponse::from)
                .toList();
    }

    public BuyerContractDetailResponse getContract(Integer userId, Integer contractId) {
        Contract contract = findBuyerContract(contractId, userId);

        List<ContractItem> items =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc(
                                contractId
                        );

        return BuyerContractDetailResponse.from(contract, items);

    }

    public byte[] previewContract(
            Integer userId,
            Integer contractId,
            BuyerContractPreviewRequest request
    ) {
        Contract contract = findBuyerContract(contractId, userId);

        if (contract.getStatus() != ContractStatus.SELLER_SIGNED) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        List<ContractItem> contractItems =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc(
                                contractId
                        );

        ContractSignature sellerSignature =
                contractSignatureRepository
                        .findByContract_ContractIdAndSignerRole(
                                contractId,
                                SignerRole.SELLER
                        )
                        .orElseThrow(() ->
                                new BusinessException(
                                        ErrorCode.CONTRACT_SIGNATURE_NOT_FOUND
                                )
                        );

        return contractPdfGenerator.generateBuyerPreview(
                contract,
                contractItems,
                sellerSignature,
                request.signatureText(),
                request.signatureImageUrl()
        );
    }

    @Transactional
    public void signContract(  Integer userId,
                               Integer contractId,
                               BuyerContractSignRequest request,
                               String signedIp,
                               String userAgent) {

        User buyer = userReader.getUser(userId);
        Contract contract =
                findBuyerContract(contractId, buyer.getUserId());

        if (contract.getStatus() != ContractStatus.SELLER_SIGNED) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        boolean alreadySigned =
                contractSignatureRepository
                        .existsByContract_ContractIdAndSignerRole(
                                contractId,
                                SignerRole.BUYER
                        );

        if (alreadySigned) {
            throw new BusinessException(ErrorCode.CONTRACT_ALREADY_SIGNED);
        }

        List<ContractItem> contractItems =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc
                                (
                                        contractId
                                );

        String currentContractHash =
                contractHashGenerator.generateHash(
                        contract,
                        contractItems
                );

        ContractSignature sellerSignature =
                contractSignatureRepository
                        .findByContract_ContractIdAndSignerRole(
                                contractId,
                                SignerRole.SELLER
                        )
                        .orElseThrow(
                                () -> new BusinessException(ErrorCode.CONTRACT_NOT_FOUND)
                        );

        boolean isContractValid =
                contract.getContractHash() != null
                && contract.getContractHash().equals(currentContractHash)
                && contract.getContractHash().equals(sellerSignature.getSignatureHash());

        if (!isContractValid) {
            throw new BusinessException(ErrorCode.CONTRACT_CONTENT_CHANGED);
        }

        ContractSignature signature = new ContractSignature(
                contract,
                buyer,
                SignerRole.BUYER,
                request.signatureText(),
                request.signatureImageUrl(),
                currentContractHash,
                signedIp,
                userAgent
        );

        ContractSignature buyerSignature
                = contractSignatureRepository.save(signature);

        contract.buyerSign();
        contract.complete();

        orderRepository.findByQuote_QuoteIdInAndBuyer_UserIdAndIsSampleTrueOrderByCreatedAtDesc(
                List.of(contract.getQuote().getQuoteId()),
                buyer.getUserId()
        ).stream().findFirst().ifPresent(sampleOrder ->
                orderLogRepository.save(
                        OrderLog.createProcessLog(
                                sampleOrder,
                                OrderProcessStep.CONTRACT_CONFIRMED,
                                buyer,
                                "계약이 확정되었습니다."
                        )
                )
        );

        byte[] pdfBytes =
                contractPdfGenerator.generate(
                        contract,
                        contractItems,
                        List.of(
                                sellerSignature,
                                buyerSignature
                        )
                );

        String pdfHash =
                sha256HashGenerator.hashBytes(pdfBytes);

        String pdfUrl =
                imageUploadService.uploadPdf(
                        pdfBytes,
                        "contracts/" + contract.getContractId()
                );

        contract.completePdf(
                pdfUrl,
                pdfHash
        );
    }

    private Contract findBuyerContract(Integer contractId, Integer buyerId) {
        return contractRepository
                .findByContractIdAndQuote_Buyer_UserId(
                        contractId,
                        buyerId
                )
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CONTRACT_NOT_FOUND));
    }
}
