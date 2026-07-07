package kr.remerge.stylehub.domain.settlement;

import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.order.entity.Order; // 💡 프로젝트의 실제 Order 엔티티 경로에 맞게 자동 임포트 확인
import kr.remerge.stylehub.domain.order.enumtype.OrderStatus;
import kr.remerge.stylehub.domain.order.repository.OrderRepository;
import kr.remerge.stylehub.domain.settlement.dto.SettlementDashboard;
import kr.remerge.stylehub.domain.settlement.dto.SettlementDto;
import kr.remerge.stylehub.domain.settlement.entity.Settlement;
import kr.remerge.stylehub.domain.settlement.enums.SettlementStatus;
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

    private final SettlementRepository settlementRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final EntityManager em;

    public SettlementDashboard getSettlementDashboard() {
        SettlementDashboard dashboard = new SettlementDashboard();
        SettlementDashboard.Summary summary = new SettlementDashboard.Summary();

        // ==========================================
        // [전략 1] OrderRepository를 손대지 않는 우회 로직
        // ==========================================
        // 1. 코드를 고칠 수 없는 orderRepository의 기본 findAll() 메서드로 모든 주문을 가져옵니다.
        List<Order> allOrders = orderRepository.findAll();

        // 2. 자바 Stream을 사용하여 메모리 상에서 "COMPLETED" 상태인 주문들의 totalAmount를 합산합니다.
        long totalGMV = allOrders.stream()
                .filter(order -> order != null && OrderStatus.COMPLETED == order.getStatus())
                .mapToLong(Order::getTotalAmount)
                .sum();

        summary.setTotalGMV(totalGMV);
        // ==========================================

        // settlements 테이블 관련 수수료 및 금액 합산 (기존 레포지토리 메서드 활용)
        Long totalFee = settlementRepository.sumPlatformFee();
        summary.setTotalFee(totalFee != null ? totalFee : 0L);

        Long pendingAmount = settlementRepository.sumTotalAmountByStatus(SettlementStatus.PENDING);
        summary.setPendingAmount(pendingAmount != null ? pendingAmount : 0L);

        Long refundAmount = settlementRepository.sumTotalAmountByStatus(SettlementStatus.REFUNDED);
        summary.setRefundRequestAmount(refundAmount != null ? refundAmount : 0L);

        // 💡 오타 수정: 기존 코드가 response로 되어 있던 부분을 상단에 선언된 dashboard로 일치시켰습니다.
        dashboard.setSummary(summary);

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

        // ==========================================================
        // 3. [교체] userStats (구매자 / 공급사 수치) 실제 DB 조회 및 세팅
        // ==========================================================
        SettlementDashboard.UserStats userStats = new SettlementDashboard.UserStats();

        // 🔍 바이어(BUYER) 통계
        String buyerSql = "SELECT COUNT(*), " +
                "COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END) " +
                "FROM users WHERE business_role IN ('BUYER', 'BOTH') AND status != 'DELETED'";
        Object[] buyerResult = (Object[]) em.createNativeQuery(buyerSql).getSingleResult();

        SettlementDashboard.UserStats.BuyerStats buyerStats = new SettlementDashboard.UserStats.BuyerStats();
        buyerStats.setTotal(((Number) buyerResult[0]).longValue());
        buyerStats.setThisMonth(((Number) buyerResult[1]).longValue());
        buyerStats.setActive(((Number) buyerResult[0]).longValue());     // 우선 전체 카운트로 동기화

        userStats.setBuyers(buyerStats);

        // 🔍 셀러(SELLER) 통계
        String sellerSql = "SELECT COUNT(*), " +
                "COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH) THEN 1 END), " +
                "COUNT(CASE WHEN status = 'APPROVED' THEN 1 END) " +
                "FROM users WHERE business_role IN ('SELLER', 'BOTH') AND status != 'DELETED'";
        Object[] sellerResult = (Object[]) em.createNativeQuery(sellerSql).getSingleResult();

        SettlementDashboard.UserStats.SellerStats sellerStats = new SettlementDashboard.UserStats.SellerStats();
        sellerStats.setTotal(((Number) sellerResult[0]).longValue());
        sellerStats.setThisMonth(((Number) sellerResult[1]).longValue());
        sellerStats.setVerified(((Number) sellerResult[2]).longValue());  // APPROVED된 실활동 공급사 수

        userStats.setSellers(sellerStats);

        dashboard.setUserStats(userStats);

        // ==========================================================
        // 4. 하단 메인 테이블 데이터 세팅
        // ==========================================================
        // 💡 변경: Order가 아니라 Settlement 기준으로 조회해야 실제 정산 상태
        //    (PENDING/COMPLETED/REFUNDED)가 테이블에 반영됩니다.
        List<SettlementDashboard.RecentPayment> rows = settlementRepository.findAllByOrderByCreatedAtDesc().stream()
                .limit(10)
                .map(settlement -> {
                    SettlementDashboard.RecentPayment row = new SettlementDashboard.RecentPayment();
                    row.setSettlementId(settlement.getSettlementId());
                    row.setOrderNo(settlement.getOrder() != null ? settlement.getOrder().getOrderNo() : null);
                    row.setCreatedAt(settlement.getCreatedAt() != null ? settlement.getCreatedAt().toString() : null);
                    row.setBuyerId(settlement.getBuyer() != null ? settlement.getBuyer().getUserId() : null);
                    // sellerId는 sellerCompany의 PK이므로 User -> Company를 거쳐서 조회
                    row.setSellerId(settlement.getSeller() != null && settlement.getSeller().getCompany() != null
                            ? settlement.getSeller().getCompany().getCompanyId()
                            : null);
                    row.setSellerCompanyName(settlement.getSeller() != null && settlement.getSeller().getCompany() != null
                            ? settlement.getSeller().getCompany().getName()
                            : null);
                    row.setTotalAmount(settlement.getTotalAmount());
                    row.setPlatformFee(settlement.getPlatformFee());
                    row.setFinalAmount(settlement.getFinalAmount());
                    row.setStatus(settlement.getStatus() != null ? settlement.getStatus().name() : null);
                    row.setReceiverName(settlement.getReceiverName());
                    return row;
                })
                .toList();
        dashboard.setRows(rows);
        return dashboard;
    }

    /**
     * 주문이 COMPLETED(바이어 거래 확정) 상태가 될 때 호출되어 정산 건을 자동 생성한다.
     * BuyerOrderService.confirmOrder()에서 order.agree() 직후 호출됨.
     */
    @Transactional
    public void createSettlementForOrder(Order order) {
        User seller = findCompanyPresident(order.getSellerCompany());

        Settlement settlement = Settlement.builder()
                .order(order)
                .seller(seller)
                .buyer(order.getBuyer())
                .receiverName(order.getReceiverName())
                .totalAmount(order.getTotalAmount())
                .platformFee(order.getPlatformFee())
                .finalAmount(order.getTotalAmount() - order.getPlatformFee())
                .status(SettlementStatus.PENDING)
                .build();

        settlementRepository.save(settlement);
    }

    // 셀러 회사의 대표(PRESIDENT) User를 조회. 여러 명일 경우 첫 번째를 사용.
    private User findCompanyPresident(Company sellerCompany) {
        return userRepository.findByCompany_CompanyIdAndRole(
                        sellerCompany.getCompanyId(),
                        UserRole.PRESIDENT
                )
                .stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "회사(companyId=" + sellerCompany.getCompanyId() + ")의 대표(PRESIDENT) 계정을 찾을 수 없습니다."
                ));
    }

    @Transactional
    public void saveSettlement(SettlementDto settlementDto) {
        // 정산 저장 로직 구현부
    }
}