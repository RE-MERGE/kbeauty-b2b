package kr.remerge.stylehub.domain.contract.dto;

import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.enumtype.ContractStatus;

import java.time.LocalDateTime;

public record BuyerContractListResponse(
        Integer contractId,
        String contractNo,
        String contractName,
        String quoteNo,
        String productName,
        String sellerCompanyName,
        Long contractAmount,
        ContractStatus status,
        LocalDateTime createdAt,
        LocalDateTime completedAt,
        String pdfUrl
) {
    public static BuyerContractListResponse from(Contract contract) {
        return new BuyerContractListResponse(
                contract.getContractId(),
                contract.getContractNo(),
                contract.getContractName(),
                contract.getQuote().getQuoteNo(),
                contract.getQuote().getProductName(),
                contract.getSellerCompanyName(),
                contract.getContractAmount(),
                contract.getStatus(),
                contract.getCreatedAt(),
                contract.getCompletedAt(),
                contract.getPdfUrl()
        );
    }
}
