package kr.remerge.stylehub.domain.deliveryTracker.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.deliveryTracker.enumtype.DeliveryStatus;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "delivery_tracking_status")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@AllArgsConstructor
public class DeliveryTrackingStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Integer orderId;

    @Column(name = "carrier_id", nullable = false, length = 50)
    private String carrierId;           // ex) kr.cjlogistics

    @Column(name = "tracking_number", nullable = false, length = 100)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "last_status", nullable = false, length = 30)
    private DeliveryStatus lastStatus;  // 우리 도메인 enum (REGISTERED, IN_TRANSIT 등)

    @Column(name = "last_description", length = 255)
    private String lastDescription;

    @Column(name = "last_location", length = 100)
    private String lastLocation;

    @Column(name = "last_event_time", length = 50)
    private String lastEventTime;       // DeliveryTracker 응답의 time (ISO string)

    @Column(name = "synced_at", nullable = false)
    private LocalDateTime syncedAt;     // 마지막 폴링/동기화 시각

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public void update(DeliveryStatus newStatus, String description,
                       String location, String eventTime) {
        this.lastStatus = newStatus;
        this.lastDescription = description;
        this.lastLocation = location;
        this.lastEventTime = eventTime;
        this.syncedAt = LocalDateTime.now();
    }
}