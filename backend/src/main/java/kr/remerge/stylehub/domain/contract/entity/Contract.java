package kr.remerge.stylehub.domain.contract.entity;


import jakarta.persistence.*;
import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.contract.enumtype.ContractStatus;
import kr.remerge.stylehub.domain.quote.entity.Quote;
import kr.remerge.stylehub.global.entity.BaseEntity;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "contracts")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contract extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contract_id")
    private Long contractId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    private Quote quote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Column(name = "buyer_company_name", nullable = false, length = 100)
    private String buyerCompanyName;

    @Column(name = "seller_company_name", nullable = false, length = 100)
    private String sellerCompanyName;

    @Column(name = "contract_no", nullable = false, unique = true, length = 30)
    private String contractNo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status = ContractStatus.DRAFT;

    @Column(name = "contract_amount", nullable = false)
    private Long contractAmount;

    @Column(name = "contract_hash", length = 255)
    private String contractHash;

    @Column(name = "pdf_url", length = 2000)
    private String pdfUrl;

    @Column(name = "buyer_signed_at")
    private LocalDateTime buyerSignedAt;

    @Column(name = "seller_signed_at")
    private LocalDateTime sellerSignedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public Contract(
            Quote quote,
            Company company,
            String buyerCompanyName,
            String sellerCompanyName,
            String contractNo,
            Long contractAmount
    ) {
        this.quote = quote;
        this.company = company;
        this.buyerCompanyName = buyerCompanyName;
        this.sellerCompanyName = sellerCompanyName;
        this.contractNo = contractNo;
        this.contractAmount = contractAmount;
        this.status = ContractStatus.DRAFT;
    }

    public void sellerSign() {
        this.status = ContractStatus.SELLER_SIGNED;
        this.sellerSignedAt = LocalDateTime.now();
    }

    public void buyerSign() {
        this.status = ContractStatus.BUYER_SIGNED;
        this.buyerSignedAt = LocalDateTime.now();
    }

    public void complete() {
        this.status = ContractStatus.COMPLETED;
        this.completedAt = LocalDateTime.now();
    }

    public void cancel() {
        this.status = ContractStatus.CANCELED;
    }

    public void expire() {
        this.status = ContractStatus.EXPIRED;
    }

    public void updatePdfUrl(String pdfUrl) {
        this.pdfUrl = pdfUrl;
    }

    public void updateContractHash(String contractHash) {
        this.contractHash = contractHash;
    }
}
