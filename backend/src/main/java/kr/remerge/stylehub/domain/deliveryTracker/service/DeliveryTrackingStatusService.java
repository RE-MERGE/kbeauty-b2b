package kr.remerge.stylehub.domain.deliveryTracker.service;

import kr.remerge.stylehub.domain.deliveryTracker.DeliveryTrackingDto;
import kr.remerge.stylehub.domain.deliveryTracker.DeliveryTrackingService;
import kr.remerge.stylehub.domain.deliveryTracker.dto.DeliveryRegisterRequest;
import kr.remerge.stylehub.domain.deliveryTracker.dto.DeliveryTrackingResponse;
import kr.remerge.stylehub.domain.deliveryTracker.entity.DeliveryTrackingStatus;
import kr.remerge.stylehub.domain.deliveryTracker.enumtype.DeliveryStatus;
import kr.remerge.stylehub.domain.deliveryTracker.repository.DeliveryTrackingStatusRepository;
import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DeliveryTrackingStatusService {

    private final DeliveryTrackingStatusRepository deliveryTrackingStatusRepository;
    private final DeliveryTrackingService deliveryTrackingService;
    private final OrderRepository orderRepository;

    // 운송장 등록 — 셀러가 호출
    @Transactional
    public void register(Integer requestingCompanyId, DeliveryRegisterRequest request) {
        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));

        // 셀러 본인 회사 주문인지 검증
        if (!Objects.equals(order.getSellerCompany().getCompanyId(), requestingCompanyId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // order 엔티티에 carrier/trackingNumber 기록 + shippedAt 자동 세팅
        order.registerShipment(request.carrierName(), request.trackingNumber());
        order.changeStatus(OrderStatus.SHIPPED);

        // delivery_tracking_status upsert (재등록 시 기존 행 갱신)
        DeliveryTrackingStatus existing = deliveryTrackingStatusRepository
                .findByOrderId(request.orderId())
                .orElse(null);

        DeliveryTrackingStatus tracking;
        if (existing != null) {
            tracking = DeliveryTrackingStatus.builder()
                    .id(existing.getId())
                    .orderId(request.orderId())
                    .carrierId(request.carrierId())
                    .trackingNumber(request.trackingNumber())
                    .lastStatus(DeliveryStatus.REGISTERED)
                    .lastDescription("운송장이 등록되었습니다.")
                    .lastLocation(null)
                    .lastEventTime(null)
                    .syncedAt(LocalDateTime.now())
                    .createdAt(existing.getCreatedAt())
                    .build();
        } else {
            tracking = DeliveryTrackingStatus.builder()
                    .orderId(request.orderId())
                    .carrierId(request.carrierId())
                    .trackingNumber(request.trackingNumber())
                    .lastStatus(DeliveryStatus.REGISTERED)
                    .lastDescription("운송장이 등록되었습니다.")
                    .lastLocation(null)
                    .lastEventTime(null)
                    .syncedAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .build();
        }

        deliveryTrackingStatusRepository.save(tracking);
    }

    // 배송 현황 조회
    @Transactional
    public DeliveryTrackingResponse.TrackingResult track(Integer orderId) {
        DeliveryTrackingStatus tracking = deliveryTrackingStatusRepository
                .findByOrderId(orderId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DELIVERY_NOT_FOUND));

        // DELIVERED 이후엔 DeliveryTracker 호출 없이 DB 캐시 그대로 반환
        if (tracking.getLastStatus() == DeliveryStatus.DELIVERED) {
            return buildResult(orderId, tracking, List.of());
        }

        // DeliveryTracker 실시간 호출
        DeliveryTrackingDto.TrackingResponse response = deliveryTrackingService
                .getTrackingInfo(tracking.getCarrierId(), tracking.getTrackingNumber());

        // lastEvent → DeliveryStatus 변환 후 DB 동기화
        DeliveryStatus currentStatus = tracking.getLastStatus();
        if (response.lastEvent() != null) {
            currentStatus = DeliveryStatus.from(response.lastEvent().status().code());
            tracking.update(
                    currentStatus,
                    response.lastEvent().description(),
                    response.lastEvent().location() != null
                            ? response.lastEvent().location().name()
                            : null,
                    response.lastEvent().time()
            );
        }

        // DELIVERED 전환 시 order.deliveredAt 자동 세팅
        if (currentStatus == DeliveryStatus.DELIVERED) {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new BusinessException(ErrorCode.ORDER_NOT_FOUND));
            if (order.getStatus() == OrderStatus.SHIPPED) {
                order.markDelivered(); // deliveredAt + status 동시 세팅
            }
        }

        // events 변환 (null-safe)
        List<DeliveryTrackingResponse.EventResult> events = response.events() != null
                ? response.events().stream()
                .map(DeliveryTrackingResponse.EventResult::from)
                .toList()
                : List.of();

        return buildResult(orderId, tracking, events);
    }

    // 응답 조립 공통 메서드
    private DeliveryTrackingResponse.TrackingResult buildResult(
            Integer orderId,
            DeliveryTrackingStatus tracking,
            List<DeliveryTrackingResponse.EventResult> events
    ) {
        return new DeliveryTrackingResponse.TrackingResult(
                orderId,
                tracking.getCarrierId(),
                tracking.getTrackingNumber(),
                tracking.getLastStatus(),
                tracking.getLastStatus().getLabel(),
                tracking.getLastDescription(),
                tracking.getLastLocation(),
                tracking.getLastEventTime(),
                events
        );
    }
}