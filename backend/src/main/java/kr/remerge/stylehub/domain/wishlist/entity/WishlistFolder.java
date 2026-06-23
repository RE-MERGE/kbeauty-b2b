package kr.remerge.stylehub.domain.wishlist.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.global.entity.BaseEntity;
import lombok.*;

@Entity
@Table(
        name = "wishlist_folders",
        indexes = {
                @Index(name = "idx_wishlist_folders_user_id", columnList = "user_id")
        },
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_wishlist_folder_user_name",
                        columnNames = {"user_id", "folder_name"}
                )
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WishlistFolder extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "wishlist_folder_id")
    private Integer wishlistFolderId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "folder_name", nullable = false, length = 50)
    private String folderName;

    @Builder.Default
    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
}