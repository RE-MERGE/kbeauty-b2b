package kr.remerge.stylehub.domain.deliveryTracker.repository;

import kr.remerge.stylehub.domain.deliveryTracker.entity.DeliveryTrackingStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryTrackingStatusRepository extends JpaRepository<DeliveryTrackingStatus, Integer> {
    Optional<DeliveryTrackingStatus> findByOrderId(Integer orderId);
}