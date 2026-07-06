package kr.remerge.stylehub.domain.dispute.service;

import kr.remerge.stylehub.domain.dispute.dto.DisputeCreateRequest;
import kr.remerge.stylehub.domain.dispute.dto.DisputeCreateResponse;
import kr.remerge.stylehub.domain.dispute.dto.DisputeListResponse;
import kr.remerge.stylehub.domain.dispute.dto.DisputeResponseCreateRequest;
import kr.remerge.stylehub.domain.dispute.entity.Dispute;
import kr.remerge.stylehub.domain.dispute.entity.DisputeItem;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeStatus;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeType;
import kr.remerge.stylehub.domain.dispute.enumtype.ResponderRole;
import kr.remerge.stylehub.domain.dispute.repository.DisputeItemRepository;
import kr.remerge.stylehub.domain.dispute.repository.DisputeRepository;
import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.entity.OrderItem;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;
import kr.remerge.stylehub.domain.order.repository.OrderItemRepository;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.domain.order.service.OrderStatusService;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;
import kr.remerge.stylehub.domain.user.support.UserReader;
import kr.remerge.stylehub.global.exception.BusinessException;
import kr.remerge.stylehub.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DisputeService {

    private static final Set<DisputeStatus> ACTIVE_STATUSES =
            EnumSet.of(
                    DisputeStatus.RECEIVED,
                    DisputeStatus.REVIEWING,
                    DisputeStatus.WAITING_SELLER,
                    DisputeStatus.WAITING_BUYER
            );

    private static final Set<DisputeType> ITEM_REQUIRED_TYPES =
            EnumSet.of(
                    DisputeType.PRODUCT_DEFECT,
                    DisputeType.WRONG_ITEM,
                    DisputeType.MISSING_ITEM
            );

    private final DisputeRepository disputeRepository;
    private final DisputeItemRepository disputeItemRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderStatusService orderStatusService;
    private final UserReader userReader;

    @Transactional
    public DisputeCreateResponse createDispute(
            Integer userId,
            Integer orderId,
            DisputeCreateRequest request
    ) {
        Order order = findBuyerOrder(userId, orderId);

        validateOrderStatus(order);
        validateDuplicateDispute(orderId);

        List<DisputeCreateRequest.Item> requestedItems =
                request.items() == null
                        ? List.of()
                        : request.items();

        validateRequiredItems(
                request.disputeType(),
                requestedItems
        );

        List<OrderItem> orderItems =
                findAndValidateOrderItems(
                        orderId,
                        requestedItems
                );

        Dispute dispute = disputeRepository.save(
                new Dispute(
                        order,
                        order.getBuyer(),
                        order.getSellerCompany(),
                        request.disputeType(),
                        createTitle(order, request.disputeType()),
                        request.buyerClaim().trim(),
                        request.requestedAction()
                )
        );

        saveDisputeItems(
                dispute,
                requestedItems,
                orderItems,
                request
        );

        // 주문 상태 변경과 상태 로그 저장은 기존 공통 서비스를 사용한다.
        orderStatusService.changeStatus(
                orderId,
                order.getBuyer(),
                OrderStatus.DISPUTE
        );

        return DisputeCreateResponse.from(dispute);
    }

    public void createResponse(
            Integer userId,
            Integer disputeId,
            DisputeResponseCreateRequest request,
            ResponderRole responderRole
    ) {

    }

    private Order findBuyerOrder(
            Integer userId,
            Integer orderId
    ) {
        return orderRepository
                .findByOrderIdAndBuyer_UserId(orderId, userId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.ORDER_NOT_FOUND)
                );
    }

    private void validateOrderStatus(Order order) {
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new BusinessException(
                    ErrorCode.INVALID_ORDER_STATUS
            );
        }
    }

    private void validateDuplicateDispute(Integer orderId) {
        boolean exists =
                disputeRepository.existsByOrder_OrderIdAndStatusIn(
                        orderId,
                        List.copyOf(ACTIVE_STATUSES)
                );

        if (exists) {
            throw new BusinessException(
                    ErrorCode.DISPUTE_ALREADY_EXISTS
            );
        }
    }

    private void validateRequiredItems(
            DisputeType disputeType,
            List<DisputeCreateRequest.Item> items
    ) {
        if (ITEM_REQUIRED_TYPES.contains(disputeType)
                && items.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.DISPUTE_ITEM_REQUIRED
            );
        }
    }

    private List<OrderItem> findAndValidateOrderItems(
            Integer orderId,
            List<DisputeCreateRequest.Item> requestedItems
    ) {
        if (requestedItems.isEmpty()) {
            return List.of();
        }

        List<Integer> orderItemIds = requestedItems.stream()
                .map(DisputeCreateRequest.Item::orderItemId)
                .distinct()
                .toList();

        // 같은 주문 상품이 요청에 중복으로 들어오는 것을 차단한다.
        if (orderItemIds.size() != requestedItems.size()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT);
        }

        List<OrderItem> orderItems =
                orderItemRepository
                        .findByOrderItemIdInAndOrder_OrderId(
                                orderItemIds,
                                orderId
                        );

        if (orderItems.size() != orderItemIds.size()) {
            throw new BusinessException(
                    ErrorCode.DISPUTE_ITEM_NOT_FOUND
            );
        }

        return orderItems;
    }

    private void saveDisputeItems(
            Dispute dispute,
            List<DisputeCreateRequest.Item> requestedItems,
            List<OrderItem> orderItems,
            DisputeCreateRequest request
    ) {
        if (requestedItems.isEmpty()) {
            return;
        }

        Map<Integer, OrderItem> orderItemById =
                orderItems.stream()
                        .collect(Collectors.toMap(
                                OrderItem::getOrderItemId,
                                Function.identity()
                        ));

        List<DisputeItem> disputeItems =
                requestedItems.stream()
                        .map(item -> {
                            OrderItem orderItem =
                                    orderItemById.get(item.orderItemId());

                            if (item.claimQuantity()
                                    > orderItem.getQuantity()) {
                                throw new BusinessException(
                                        ErrorCode.INVALID_DISPUTE_QUANTITY
                                );
                            }

                            return new DisputeItem(
                                    dispute,
                                    orderItem,
                                    item.claimQuantity(),
                                    item.claimReason().trim(),
                                    request.requestedAction().name()
                            );
                        })
                        .toList();

        disputeItemRepository.saveAll(disputeItems);
    }

    private String createTitle(
            Order order,
            DisputeType disputeType
    ) {
        return order.getOrderNo()
                + " "
                + getDisputeTypeLabel(disputeType);
    }

    private String getDisputeTypeLabel(DisputeType disputeType) {
        return switch (disputeType) {
            case PRODUCT_DEFECT -> "상품 불량 이의제기";
            case WRONG_ITEM -> "오배송 이의제기";
            case MISSING_ITEM -> "상품 누락 이의제기";
            case DELIVERY_DELAY -> "배송 지연 이의제기";
            case PAYMENT -> "결제 이의제기";
            case ETC -> "기타 이의제기";
        };
    }

    public List<DisputeListResponse> getBuyerDisputes(
            Integer userId
    ) {
        return disputeRepository
                .findByBuyer_UserIdOrderByReceivedAtDesc(userId)
                .stream()
                .map(DisputeListResponse::from)
                .toList();
    }

    public List<DisputeListResponse> getSellerDisputes(
            Integer userId
    ) {
        User seller = userReader.getCompanyUser(userId);

        Integer companyId =
                seller.getCompany().getCompanyId();

        List<Dispute> disputes;

        if (seller.getRole() == UserRole.PRESIDENT) {
            disputes = disputeRepository
                    .findBySellerCompany_CompanyIdOrderByReceivedAtDesc(
                            companyId
                    );
        } else if (seller.getRole() == UserRole.EMPLOYEE) {
            disputes = disputeItemRepository.findAssignedDisputes(
                    companyId,
                    userId
            );
        } else {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        return disputes.stream()
                .map(DisputeListResponse::from)
                .toList();
    }

    @Transactional
    public void resolveByBuyer(Integer userId, Integer disputeId) {

        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DISPUTE_NOT_FOUND));

        if (!dispute.getBuyer().getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (dispute.getStatus() != DisputeStatus.WAITING_BUYER) {
            throw new BusinessException(ErrorCode.INVALID_DISPUTE_STATUS);
        }

        dispute.changeStatus(DisputeStatus.RESOLVED);
    }

    @Transactional
    public void requestAdminReview(Integer buyerId, Integer disputeId) {
        Dispute dispute = disputeRepository.findById(disputeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DISPUTE_NOT_FOUND));

        if (!dispute.getBuyer().getUserId().equals(buyerId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (dispute.getStatus() != DisputeStatus.WAITING_BUYER) {
            throw new BusinessException(ErrorCode.INVALID_DISPUTE_STATUS);
        }

        dispute.changeStatus(DisputeStatus.REVIEWING);
    }
}