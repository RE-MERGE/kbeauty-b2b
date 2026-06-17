package kr.remerge.stylehub.domain.sourcing.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sourcing_request_items")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class SourcingRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sourcing_request_item_id")
    private Integer sourcingRequestItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sourcing_id", nullable = false)
    private SourcingRequest sourcingRequest;

    @Column(name = "option_summary", nullable = false, length = 255)
    private String optionSummary;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "sample_quantity")
    private Integer sampleQuantity;
}