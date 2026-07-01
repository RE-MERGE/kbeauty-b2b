package kr.remerge.stylehub.domain.order.dto.seller;

import kr.remerge.stylehub.domain.order.entity.OrderLog;
import kr.remerge.stylehub.domain.order.enumtype.OrderLogType;
import kr.remerge.stylehub.domain.order.enumtype.OrderProcessStep;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;

import java.time.LocalDateTime;

public record SellerOrderLogResponse(

        Integer orderLogId,
        OrderLogType logType,
        OrderStatus previousStatus,
        OrderStatus newStatus,
        OrderProcessStep processStep,
        String actorName,
        String memo,
        LocalDateTime createdAt

) {

    public static SellerOrderLogResponse from(OrderLog log) {
        return new SellerOrderLogResponse(
                log.getOrderLogId(),
                log.getLogType(),
                log.getPreviousStatus(),
                log.getNewStatus(),
                log.getProcessStep(),
                log.getActorUser() == null
                        ? "시스템"
                        : log.getActorUser().getName(),
                log.getMemo(),
                log.getCreatedAt()
        );
    }
}
