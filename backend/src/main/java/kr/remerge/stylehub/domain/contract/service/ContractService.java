package kr.remerge.stylehub.domain.contract.service;

import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.contract.dto.SellerContractCreateRequest;
import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.entity.ContractItem;
import kr.remerge.stylehub.domain.contract.enumtype.ContractStatus;
import kr.remerge.stylehub.domain.contract.repository.ContractItemRepository;
import kr.remerge.stylehub.domain.contract.repository.ContractRepository;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.domain.quote.entity.QuoteItem;
import kr.remerge.stylehub.domain.quote.repository.QuoteItemRepository;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractItemRepository contractItemRepository;
    private final ContractRepository contractRepository;
    private final QuoteItemRepository quoteItemRepository;

    @Transactional
    public Contract createDraft(Quote quote, SellerContractCreateRequest request) {

        List<QuoteItem> normalItems = findNormalQuoteItems(quote);
        long contractAmount = normalItems.stream()
                .mapToLong(QuoteItem::getTotalPrice)
                .sum() + quote.getShippingFee();

        Optional<Contract> existingContract
                = contractRepository.findFirstByQuote_QuoteIdOrderByVersionDesc(quote.getQuoteId());

        if (existingContract.isPresent()) {
            Contract contract = existingContract.get();

            if (contract.getStatus() != ContractStatus.DRAFT) {
                throw new BusinessException(ErrorCode.CONTRACT_ALREADY_EXISTS);
            }

            contract.updateDraft(
                    request.contractName(),
                    request.deliveryDate(),
                    request.paymentTerms(),
                    request.returnPolicy(),
                    request.specialTerms()
            );
            contract.updateContractAmount(contractAmount);
            replaceContractItems(contract, quote, normalItems);

            return contract;
        }


        Company buyerCompany = quote.getBuyer().getCompany();
        Company sellerCompany = quote.getCompany();

        if (buyerCompany == null || sellerCompany == null) {
            throw new BusinessException(ErrorCode.COMPANY_NOT_FOUND);
        }

        Contract contract =
                Contract.createDraftFromQuote(quote,
                        createContractNo(),
                        request.contractName(),
                        contractAmount,
                        request.deliveryDate(),
                        request.paymentTerms(),
                        request.returnPolicy(),
                        request.specialTerms()
                );

        Contract savedContract = contractRepository.save(contract);

        saveContractItems(savedContract, quote, normalItems);

        return savedContract;
    }

    private void saveContractItems(
            Contract contract,
            Quote quote,
            List<QuoteItem> quoteItems
    ) {
        List<ContractItem> contractItems = quoteItems.stream()
                .map(quoteItem -> new ContractItem(
                        contract,
                        null,
                        null,
                        quote.getProductName(),
                        quoteItem.getOptionSummary(),
                        quote.getMaterial(),
                        quoteItem.getQuantity(),
                        quoteItem.getUnitPrice()
                ))
                .toList();

        contractItemRepository.saveAll(contractItems);
    }

    private List<QuoteItem> findNormalQuoteItems(Quote quote) {
        List<QuoteItem> normalItems = quoteItemRepository
                .findByQuote_QuoteId(quote.getQuoteId())
                .stream()
                .filter(item -> !Boolean.TRUE.equals(item.getIsSample()))
                .toList();

        if (normalItems.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.CONTRACT_ITEM_NOT_FOUND
            );
        }

        return normalItems;
    }

    private void replaceContractItems(
            Contract contract,
            Quote quote,
            List<QuoteItem> normalItems
    ) {
        List<ContractItem> existingItems = contractItemRepository
                .findByContract_ContractIdOrderByContractItemIdAsc(
                        contract.getContractId()
                );

        contractItemRepository.deleteAll(existingItems);
        saveContractItems(contract, quote, normalItems);
    }

    private String createContractNo() {
        String date = LocalDate.now()
                .format(DateTimeFormatter.BASIC_ISO_DATE);

        String randomValue = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();

        return "CTR-" + date + "-" + randomValue;

    }

    private void validateContractNotExists(Integer quoteId) {

        if(contractRepository.existsByQuote_QuoteId(quoteId)) {
            throw new BusinessException(ErrorCode.CONTRACT_ALREADY_EXISTS);
        }
    }

    // 협의(재계약 요청)에 대한 셀러 응답으로 새 버전의 계약서 초안을 만든다.
    // 품목은 원본 계약서 그대로 복사하고, 조건(계약명/납품일/결제조건/반품정책/특약사항/금액)만 새로 반영한다.
    // 원본은 새 버전으로 대체되었으므로 CANCELED로 전환한다.
    @Transactional
    public Contract createRevisedDraft(
            Contract original,
            String contractName,
            LocalDate deliveryDate,
            String paymentTerms,
            String returnPolicy,
            String specialTerms,
            Long contractAmount
    ) {

        Contract revision = Contract.createRevision(
                original,
                createContractNo(),
                contractName,
                contractAmount,
                deliveryDate,
                paymentTerms,
                returnPolicy,
                specialTerms
        );

        Contract savedRevision = contractRepository.save(revision);

        List<ContractItem> originalItems = contractItemRepository
                .findByContract_ContractIdOrderByContractItemIdAsc(
                        original.getContractId()
                );

        List<ContractItem> copiedItems = originalItems.stream()
                .map(item -> new ContractItem(
                        savedRevision,
                        item.getProduct(),
                        item.getProductOption(),
                        item.getProductName(),
                        item.getOptionSummary(),
                        item.getMaterial(),
                        item.getQuantity(),
                        item.getUnitPrice()
                ))
                .toList();

        contractItemRepository.saveAll(copiedItems);

        original.cancel();

        return savedRevision;
    }

}
