package kr.remerge.stylehub.domain.order.checkout.service;

import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.entity.ContractItem;
import kr.remerge.stylehub.domain.contract.enumtype.ContractStatus;
import kr.remerge.stylehub.domain.contract.repository.ContractItemRepository;
import kr.remerge.stylehub.domain.contract.repository.ContractRepository;
import kr.remerge.stylehub.domain.order.checkout.dto.ContractCheckoutItemResponse;
import kr.remerge.stylehub.domain.order.checkout.dto.ContractCheckoutResponse;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractCheckoutService {

    private final ContractRepository contractRepository;
    private final ContractItemRepository contractItemRepository;

    public ContractCheckoutResponse getCheckout(
            Integer userId,
            Integer contractId
    ) {
        Contract contract = contractRepository
                .findByContractIdAndQuote_Buyer_UserId(contractId, userId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.CONTRACT_NOT_FOUND)
                );

        if (contract.getStatus() != ContractStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.INVALID_CONTRACT_STATUS);
        }

        List<ContractItem> contractItems = contractItemRepository
                .findByContract_ContractIdOrderByContractItemIdAsc(contractId);

        List<ContractCheckoutItemResponse> items = contractItems.stream()
                .map(ContractCheckoutItemResponse::from)
                .toList();

        long productAmount = contractItems.stream()
                .mapToLong(ContractItem::getTotalPrice)
                .sum();

        return new ContractCheckoutResponse(
                contract.getContractId(),
                contract.getContractNo(),
                items,
                productAmount,
                contract.getShippingFee(),
                contract.getContractAmount()
        );
    }
}
