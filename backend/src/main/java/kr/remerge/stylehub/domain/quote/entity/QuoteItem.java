package kr.remerge.stylehub.domain.quote.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "quote_items",
        indexes = {
                @Index(name = "idx_quote_items_quote_id", columnList = "quote_id")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class QuoteItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quote_item_id")
    private Integer quoteItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quote_id", nullable = false)
    private Quote quote;

    @Column(name = "option_summary", length = 255)
    private String optionSummary;

    @Builder.Default
    @Column(nullable = false)
    private Integer quantity = 0;

    @Builder.Default
    @Column(name = "unit_price", nullable = false)
    private Long unitPrice = 0L;

    @Builder.Default
    @Column(name = "total_price", nullable = false)
    private Long totalPrice = 0L;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "is_sample", nullable = false)
    private Boolean isSample;
}
