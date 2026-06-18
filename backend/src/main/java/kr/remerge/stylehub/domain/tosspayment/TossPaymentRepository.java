package kr.remerge.stylehub.domain.tosspayment;


import org.springframework.data.jpa.repository.JpaRepository;

public interface TossPaymentRepository extends JpaRepository<Payment, String> {
    // paymentKey 기준으로 조회 등
}