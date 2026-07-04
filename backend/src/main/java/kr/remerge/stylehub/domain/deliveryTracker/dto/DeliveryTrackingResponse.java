package kr.remerge.stylehub.domain.deliveryTracker.dto;

import kr.remerge.stylehub.domain.deliveryTracker.DeliveryTrackingDto;
import kr.remerge.stylehub.domain.deliveryTracker.enumtype.DeliveryStatus;

import java.util.List;

public class DeliveryTrackingResponse {

    public record TrackingResult(
            Integer orderId,
            String carrierId,
            String trackingNumber,
            DeliveryStatus status,       // enum 값 (IN_TRANSIT 등)
            String statusLabel,          // 한글 라벨 ("배송 중")
            String lastDescription,
            String lastLocation,
            String lastEventTime,
            List<EventResult> events
    ) {}

    public record EventResult(
            String time,
            DeliveryStatus status,
            String statusLabel,          // 한글 라벨
            String description,
            String location
    ) {
        // DeliveryTrackingDto.TrackingEvent → EventResult 변환
        public static EventResult from(DeliveryTrackingDto.TrackingEvent event) {
            DeliveryStatus deliveryStatus = DeliveryStatus.from(event.status().code());
            return new EventResult(
                    event.time(),
                    deliveryStatus,
                    deliveryStatus.getLabel(),
                    event.description(),
                    event.location() != null ? event.location().name() : null
            );
        }
    }
}
