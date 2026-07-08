package kr.remerge.stylehub.domain.settlement;

import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.order.entity.Order;
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.domain.settlement.dto.SettlementDashboard;
import kr.remerge.stylehub.domain.settlement.dto.SettlementDto;
import kr.remerge.stylehub.domain.user.entity.User;
import kr.remerge.stylehub.domain.user.enumtype.UserRole;
import kr.remerge.stylehub.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SettlementService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EntityManager em;

    public SettlementDashboard getSettlementDashboard() {
        SettlementDashboard dashboard = new SettlementDashboard();
        SettlementDashboard.Summary summary = new SettlementDashboard.Summary();

        // ==========================================
        // Order 테이블만으로 요약 지표 계산
        // ==========================================
        List<Order> allOrders = orderRepository.findAll();

        List<Order> completedOrders = allOrders.stream()
                .filter(order -> order != null && OrderStatus.COMPLETED == order.getStatus())
                .toList();

        long totalGMV = completedOrders.stream()
                .mapToLong(Order::getTotalAmount)
                .sum();

        long totalFee = completedOrders.stream()
                .mapToLong(Order::getPlatformFee)
                .sum();

        summary.setTotalGMV(totalGMV);
        summary.setTotalFee(totalFee);

        // 💡 실제 프로젝트의 OrderStatus enum 값에 맞게 상태명 확인 필요
        //    (예시로 PENDING/CANCELED를 가정했습니다. 다르면 아래 두 값만 교체하면 됩니다.)
        long pendingAmount = allOrders.stream()
                .filter(order -> order != null && OrderStatus.PENDING == order.getStatus())
                .mapToLong(Order::getTotalAmount)
                .sum();
        summary.setPendingAmount(pendingAmount);

        long refundRequestAmount = allOrders.stream()
                .filter(order -> order != null && OrderStatus.CANCELED == order.getStatus())
                .mapToLong(Order::getTotalAmount)
                .sum();
        summary.setRefundRequestAmount(refundRequestAmount);

        dashboard.setSummary(summary);

        // ==========================================
        // 월별 통계 (기존 native query 그대로 유지)
        // ==========================================
        List<SettlementDashboard.MonthlyStat> paymentStats = new ArrayList<>();
        String monthlySql = "SELECT " +
                "    DATE_FORMAT(created_at, '%Y-%m') as month, " +
                "    SUM(total_amount) as total, " +
                "    COUNT(order_id) as count, " +
                "    AVG(total_amount) as avgOrder " +
                "FROM orders " +
                "WHERE status = 'COMPLETED' " +
                "GROUP BY DATE_FORMAT(created_at, '%Y-%m') " +
                "ORDER BY month DESC LIMIT 6";

        List<Object[]> monthlyResults = em.createNativeQuery(monthlySql).getResultList();

        for (Object[] result : monthlyResults) {
            SettlementDashboard.MonthlyStat stat = new SettlementDashboard.MonthlyStat();
            stat.setMonth((String) result[0]);
            stat.setTotal(((Number) result[1]).longValue());
            stat.setCount(((Number) result[2]).longValue());
            stat.setAvgOrder(((Number) result[3]).longValue());
            paymentStats.add(stat);
        }
        dashboard.setPaymentStats(paymentStats);

        // ==========================================
        // userStats (기존 native query 그대로 유지)
        // ==========================================
        SettlementDashboard.UserStats userStats = new SettlementDashboard.UserStats();

        String buyerSql = "SELECT COUNT(*), " +
                "COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) " +
                "FROM users WHERE business_role IN ('BUYER', 'BOTH') AND status != 'DELETED'";
        Object[] buyerResult = (Object[]) em.createNativeQuery(buyerSql).getSingleResult();

        SettlementDashboard.UserStats.BuyerStats buyerStats = new SettlementDashboard.UserStats.BuyerStats();
        buyerStats.setTotal(((Number) buyerResult[0]).longValue());
        buyerStats.setThisMonth(((Number) buyerResult[1]).longValue());
        buyerStats.setActive(((Number) buyerResult[0]).longValue());

        userStats.setBuyers(buyerStats);

        String sellerSql = "SELECT COUNT(*), " +
                "COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END), " +
                "COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) " +
                "FROM users WHERE business_role IN ('SELLER', 'BOTH') AND status != 'DELETED'";
        Object[] sellerResult = (Object[]) em.createNativeQuery(sellerSql).getSingleResult();

        SettlementDashboard.UserStats.SellerStats sellerStats = new SettlementDashboard.UserStats.SellerStats();
        sellerStats.setTotal(((Number) sellerResult[0]).longValue());
        sellerStats.setThisMonth(((Number) sellerResult[1]).longValue());
        sellerStats.setVerified(((Number) sellerResult[2]).longValue());

        userStats.setSellers(sellerStats);
        dashboard.setUserStats(userStats);

        // ==========================================
        // 하단 목록: Order 테이블만으로 채움 (Settlement 완전 미사용)
        // ==========================================
        List<SettlementDashboard.RecentPayment> rows = allOrders.stream()
                .filter(order -> order != null && OrderStatus.COMPLETED == order.getStatus())
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .limit(10)
                .map(order -> {
                    SettlementDashboard.RecentPayment row = new SettlementDashboard.RecentPayment();
                    row.setSettlementId(order.getOrderId()); // 💡 정산ID 자리에 주문ID 사용
                    row.setOrderNo(order.getOrderNo());
                    row.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().toString() : null);
                    row.setBuyerId(order.getBuyer() != null ? order.getBuyer().getUserId() : null);
                    row.setSellerId(order.getSellerCompany() != null ? order.getSellerCompany().getCompanyId() : null);
                    row.setSellerCompanyName(order.getSellerCompany() != null ? order.getSellerCompany().getName() : null);
                    row.setTotalAmount(order.getTotalAmount());
                    row.setPlatformFee(order.getPlatformFee());
                    row.setFinalAmount(order.getTotalAmount() - order.getPlatformFee());
                    row.setStatus("COMPLETED"); // 💡 정산 개념 없이 주문 완료 여부만 표시
                    row.setReceiverName(order.getReceiverName());
                    return row;
                })
                .toList();
        dashboard.setRows(rows);

        return dashboard;
    }

    @Transactional
    public void saveSettlement(SettlementDto settlementDto) {
        // 정산 저장 로직 (현재 Order 기반 조회 방식에서는 사용 안 함)
    }
}