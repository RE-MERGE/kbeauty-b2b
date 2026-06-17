package kr.remerge.stylehub.domain.user.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.company.entity.Address;
import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.user.enumtype.BusinessRole;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;
import kr.remerge.stylehub.domain.user.enumtype.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_shipping_address_id")
    private Address defaultShippingAddress;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_receiving_address_id")
    private Address defaultReceivingAddress;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(length = 255)
    private String password;

    @Column(length = 20)
    private String name;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BusinessRole businessRole;

    @Column(length = 2000)
    private String profileImageUrl;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private LocalDateTime updatedAt;

    private LocalDateTime lastLoginAt;

    @Column(length = 45)
    private String lastLoginIp;

    private LocalDateTime createdAt;

    private LocalDateTime deletedAt;

    private Integer failedLoginAttempts;
}