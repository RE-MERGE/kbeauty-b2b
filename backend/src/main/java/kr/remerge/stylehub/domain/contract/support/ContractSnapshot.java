package kr.remerge.stylehub.domain.contract.support;

import kr.remerge.stylehub.domain.contract.entity.Contract;
import kr.remerge.stylehub.domain.contract.entity.ContractItem;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

public record ContractSnapshot(
        String contractNo,
        String contractName,
        Integer version,
        String quoteNo,
        String buyerCompanyName,
        String sellerCompanyName,
        Long contractAmount,
        LocalDate deliveryDate,
        String paymentTerms,
        String returnPolicy,
        String specialTerms,
        List<Item> items

) {

    public static ContractSnapshot from(
            Contract contract,
            List<ContractItem> contractItems
    ) {
        List<Item> items = contractItems.stream()
                .sorted(Comparator.comparing(
                        ContractItem::getContractItemId
                ))
                .map(Item::from)
                .toList();

        return new ContractSnapshot(
                contract.getContractNo(),
                contract.getContractName(),
                contract.getVersion(),
                contract.getQuote().getQuoteNo(),
                contract.getBuyerCompanyName(),
                contract.getSellerCompanyName(),
                contract.getContractAmount(),
                contract.getDeliveryDate(),
                contract.getPaymentTerms(),
                contract.getReturnPolicy(),
                contract.getSpecialTerms(),
                items
        );
    }

    public record Item(
            String productName,
            String optionSummary,
            String material,
            Integer quantity,
            Long unitPrice,
            Long totalPrice
    ) {

        private static Item from(ContractItem item) {
            return new Item(
                    item.getProductName(),
                    item.getOptionSummary(),
                    item.getMaterial(),
                    item.getQuantity(),
                    item.getUnitPrice(),
                    item.getTotalPrice()
            );
        }
    }
}
