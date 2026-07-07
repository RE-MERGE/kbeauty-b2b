package kr.remerge.stylehub.domain.order.service;

import kr.remerge.stylehub.domain.order.dto.OrderCancelRequest;
import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.entity.OrderLog;
import kr.remerge.stylehub.domain.order.enumtype.OrderLogMemo;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;
import kr.remerge.stylehub.domain.order.repository.OrderLogRepository;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderCancellationService {

    private final UserReader userReader;
    private final OrderRepository orderRepository;
    private final OrderLogRepository orderLogRepository;

    @Transactional
    public void cancelOrder(
            Integer userId,
            Integer orderId,
            OrderCancelRequest request
    ) {

        User buyer = userReader.getUser(userId);

        Order order = orderRepository
                .findByOrderIdAndBuyer_UserId(orderId, userId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.ORDER_NOT_FOUND)
                );

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new BusinessException(
                    ErrorCode.INVALID_ORDER_STATUS
            );
        }

        OrderStatus previousStatus = order.getStatus();

        order.cancel(buyer, request.reason());

        orderLogRepository.save(
                OrderLog.createStatusLog(
                        order,
                        previousStatus,
                        OrderStatus.CANCELED,
                        buyer,
                        OrderLogMemo.ORDER_CANCELED
                )
        );
    }
}
