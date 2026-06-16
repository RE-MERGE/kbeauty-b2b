package kr.remerge.stylehub.domain.company.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.user.entity.User;

import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "companies")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "company_id")
    private Integer companyId;

    // 기본 반품지
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_return_address_id")
    private Address defaultReturnAddress;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(name = "business_number", nullable = false, unique = true, length = 20)
    private String businessNumber;

    @Column(name = "representative_name", length = 50)
    private String representativeName;

    @Column(name = "representative_phone", length = 20)
    private String representativePhone;

    @Column(name = "website_url", length = 255)
    private String websiteUrl;

    @Column(length = 2000)
    private String description;

    @Column(length = 255)
    private String address;

    @Column(name = "address_detail", length = 255)
    private String addressDetail;

    @Column(name = "logo_url", length = 2000)
    private String logoUrl;

    @Column(name = "business_license_url", length = 2000)
    private String businessLicenseUrl;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CompanyStatus status = CompanyStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "seller_status")
    private SellerStatus sellerStatus = SellerStatus.NONE;

    @Builder.Default
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "company")
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();
}