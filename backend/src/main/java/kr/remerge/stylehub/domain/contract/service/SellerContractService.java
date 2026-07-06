package kr.remerge.stylehub.domain.contract.service;

import kr.remerge.stylehub.domain.contract.dto.*;
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
import kr.remerge.stylehub.domain.quote.constant.QuoteStatusCode;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.repository.QuoteRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SellerContractService {

    private final ContractRepository contractRepository;
    private final ContractItemRepository contractItemRepository;
    private final ContractSignatureRepository contractSignatureRepository;
    private final UserReader userReader;
    private final QuoteRepository quoteRepository;
    private final ContractService contractService;
    private final ContractHashGenerator contractHashGenerator;
    private final ContractPdfGenerator contractPdfGenerator;
    private final OrderRepository orderRepository;
    private final OrderLogRepository orderLogRepository;


    public SellerContractDetailResponse getContractByQuote(
            Integer userId,
            Integer quoteId
    ) {
        User seller = userReader.getCompanyUser(userId);
        Contract contract = findContractByQuote(quoteId);
        validateSellerCompany(seller, contract);

        List<ContractItem> items =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc(
                                contract.getContractId()
                        );

        return SellerContractDetailResponse.from(contract, items);
    }

    public byte[] getContractPreview(
            Integer userId,
            Integer contractId
    ) {

        User seller = userReader.getCompanyUser(userId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() ->
                        new BusinessException(
                                ErrorCode.CONTRACT_NOT_FOUND
                        )
                );

        validateSellerCompany(seller, contract);

        validateDraftStatus(contract);

        List<ContractItem> contractItems =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc(
                                contractId
                        );

        return contractPdfGenerator.generatePreview(
                contract,
                contractItems,
                null,
                null
        );
    }

    public byte[] getContractPreview(
            Integer userId,
            Integer contractId,
            SellerContractPreviewRequest request
    ) {

        User seller = userReader.getCompanyUser(userId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CONTRACT_NOT_FOUND)
                );

        validateSellerCompany(seller, contract);
        validateDraftStatus(contract);

        List<ContractItem> contractItems =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc(
                                contractId
                        );

        String signatureText =
                request.hasSignature() ? request.signatureText() : null;

        String signatureImageUrl =
                request.hasSignature() ? request.signatureImageUrl() : null;

        return contractPdfGenerator.generatePreview(
                contract,
                contractItems,
                signatureText,
                signatureImageUrl
        );
    }

    @Transactional
    public void signAndSend(
            Integer userId,
            Integer contractId,
            SellerContractSignRequest request,
            String signedIp,
            String userAgent
    ) {
        User seller = userReader.getCompanyUser(userId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CONTRACT_NOT_FOUND)
                );

        validateSellerCompany(seller, contract);
        validateDraftStatus(contract);

        boolean alreadySigned =
                contractSignatureRepository
                        .existsByContract_ContractIdAndSignerRole(
                                contractId,
                                SignerRole.SELLER
                        );

        if (alreadySigned) {
            throw new BusinessException(
                    ErrorCode.CONTRACT_ALREADY_SIGNED
            );
        }

        List<ContractItem> contractItems =
                contractItemRepository
                        .findByContract_ContractIdOrderByContractItemIdAsc(
                                contractId
                        );

        String contractHash =
                contractHashGenerator.generateHash(
                        contract,
                        contractItems
                );

        contract.updateContractHash(contractHash);

        ContractSignature signature = new ContractSignature(
                contract,
                seller,
                SignerRole.SELLER,
                request.signatureText(),
                request.signatureImageUrl(),
                contractHash,
                signedIp,
                userAgent
        );

        contractSignatureRepository.save(signature);
        contract.sellerSign();

        orderRepository.findByQuote_QuoteIdInAndBuyer_UserIdAndIsSampleTrueOrderByCreatedAtDesc(
                List.of(contract.getQuote().getQuoteId()),
                contract.getQuote().getBuyer().getUserId()
        ).stream().findFirst().ifPresent(sampleOrder ->
                orderLogRepository.save(
                        OrderLog.createProcessLog(
                                sampleOrder,
                                OrderProcessStep.CONTRACT_SIGNING,
                                seller,
                                "계약서 서명이 진행 중입니다."
                        )
                )
        );


    }

    @Transactional
    public void updateDraft(
            Integer userId,
            Integer contractId,
            SellerContractUpdateRequest request
    ) {
        User seller = userReader.getCompanyUser(userId);

        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CONTRACT_NOT_FOUND)
                );

        validateSellerCompany(seller, contract);
        validateDraftStatus(contract);

        contract.updateDraft(
                request.contractName(),
                request.deliveryDate(),
                request.paymentTerms(),
                request.returnPolicy(),
                request.specialTerms()
        );

    }

    private Contract findContractByQuote(Integer quoteId) {
        return contractRepository.findFirstByQuote_QuoteIdOrderByVersionDesc(quoteId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CONTRACT_NOT_FOUND)
                );
    }

    private void validateSellerCompany(
            User seller,
            Contract contract
    ) {
        boolean sameCompany =
                seller.getCompany() != null
                        && Objects.equals(
                        seller.getCompany().getCompanyId(),
                        contract.getCompany().getCompanyId()
                );

        if (!sameCompany) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateDraftStatus(Contract contract) {
        if (contract.getStatus() != ContractStatus.DRAFT) {
            throw new BusinessException(
                    ErrorCode.INVALID_CONTRACT_STATUS
            );
        }
    }

    @Transactional
    public SellerContractCreateResponse createContract(Integer userId, SellerContractCreateRequest request) {

        User seller = userReader.getCompanyUser(userId);

        Quote quote = quoteRepository.findById(request.quoteId())
                .orElseThrow(() -> new BusinessException(ErrorCode.QUOTE_NOT_FOUND));

        validateApprovedQuote(quote);
        validateSellerCompany(seller, quote);

        Contract contract = contractService.createDraft(quote, request);

        return SellerContractCreateResponse.from(contract);

    }

    private void validateSellerCompany(User seller, Quote quote) {
        boolean sameCompany =
                seller.getCompany() != null
                        && Objects.equals(
                        seller.getCompany().getCompanyId(),
                        quote.getCompany().getCompanyId()
                );

        if (!sameCompany) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }

    private void validateApprovedQuote(Quote quote) {

        if (!QuoteStatusCode.APPROVED.equals(quote.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_QUOTE_STATUS);
        }
    }
}
