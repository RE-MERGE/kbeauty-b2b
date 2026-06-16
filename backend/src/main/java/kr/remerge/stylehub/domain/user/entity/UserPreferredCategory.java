package kr.remerge.stylehub.domain.user.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.product.entity.Category;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_preferred_categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_user_category",
                        columnNames = {"user_id", "category_id"}
                )
        },
        indexes = {
                @Index(name = "idx_user_id", columnList = "user_id")
        }
)
public class UserPreferredCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "preferred_category_id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // getter/setter
}