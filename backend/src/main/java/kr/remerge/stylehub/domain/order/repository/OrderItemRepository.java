package kr.remerge.stylehub.domain.order.repository;

import kr.remerge.stylehub.domain.order.entity.OrderItem;
import kr.remerge.stylehub.domain.order.enumtype.OrderItemStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {

    List<OrderItem> findByOrder_OrderId(Integer orderId);

    List<OrderItem> findByOrder_OrderIdInOrderByOrderItemIdAsc(List<Integer> orderIds);

    @EntityGraph(attributePaths = "order")
    List<OrderItem> findByAssignedUser_UserIdOrderByOrder_CreatedAtDesc(Integer userId);

    List<OrderItem> findByOrder_OrderIdAndAssignedUser_UserId(Integer orderId, Integer userId);

    boolean existsByOrder_OrderIdAndAssignedUser_UserId(Integer orderId, Integer userId);

    Optional<OrderItem> findByOrderItemIdAndAssignedUser_UserId(Integer orderItemId, Integer userId);

    long countByOrder_OrderId(Integer orderId);

    long countByOrder_OrderIdAndItemStatus(Integer orderId, OrderItemStatus orderItemStatus);
}
