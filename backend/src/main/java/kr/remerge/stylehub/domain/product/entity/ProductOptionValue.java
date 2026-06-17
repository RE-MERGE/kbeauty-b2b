package kr.remerge.stylehub.domain.product.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "product_option_values",
        indexes = {
                @Index(name = "idx_product_option_values_product_option_id", columnList = "product_option_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_product_option_value",
                        columnNames = {
                                "product_option_id",
                                "option_name",
                                "option_value"
                        }
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductOptionValue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_option_value_id")
    private Integer productOptionValueId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_option_id", nullable = false)
    private ProductOption productOption;

    @Column(name = "option_name", nullable = false, length = 50)
    private String optionName;

    @Column(name = "option_value", nullable = false, length = 50)
    private String optionValue;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}