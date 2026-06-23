package kr.remerge.stylehub.domain.sourcing.repository;

import io.lettuce.core.dynamic.annotation.Param;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingSupplier;
import kr.remerge.stylehub.domain.sourcing.enumtype.SourcingSupplierStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SourcingSupplierRepository extends JpaRepository<SourcingSupplier, Integer> {

    // 관리자 추천 목록 조회용
    List<SourcingSupplier> findAllBySourcingRequest_SourcingRequestIdAndStatus(
            Integer sourcingRequestId, SourcingSupplierStatus status);
    // 셀러 목록 조회 - company_id + status + type 필터 (current, my 탭)
    @Query("""
            SELECT ss FROM SourcingSupplier ss
            JOIN FETCH ss.sourcingRequest sr
            WHERE ss.sellerCompanyId = :companyId
            AND ss.status = :status
            AND sr.type = :type
            ORDER BY sr.createdAt DESC
            """)
    List<SourcingSupplier> findSellerRequests(
            @Param("companyId") Integer companyId,
            @Param("status") SourcingSupplierStatus status,
            @Param("type") String type
    );

    // 셀러 이전 요청 조회 - DECLINED, EXPIRED (past 탭)
    @Query("""
            SELECT ss FROM SourcingSupplier ss
            JOIN FETCH ss.sourcingRequest sr
            WHERE ss.sellerCompanyId = :companyId
            AND ss.status IN :statuses
            AND sr.type = :type
            ORDER BY sr.createdAt DESC
            """)
    List<SourcingSupplier> findSellerPastRequests(
            @Param("companyId") Integer companyId,
            @Param("statuses") List<SourcingSupplierStatus> statuses,
            @Param("type") String type
    );
}
