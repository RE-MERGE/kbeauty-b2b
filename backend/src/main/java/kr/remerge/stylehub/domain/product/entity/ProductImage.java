package kr.remerge.stylehub.domain.product.entity;


import jakarta.persistence.*;
import kr.remerge.stylehub.global.entity.BaseEntity;
import lombok.*;

@Entity
@Table(
        name = "product_images",
        indexes = {
                @Index(name = "idx_product_images_product_option_id", columnList = "product_option_id")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class ProductImage extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_image_id")
    private Integer productImageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_option_id", nullable = false)
    private ProductOption productOption;

    @Column(name = "image_url", nullable = false, length = 2000)
    private String imageUrl;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_main", nullable = false)
    private Boolean isMain = false;
}
