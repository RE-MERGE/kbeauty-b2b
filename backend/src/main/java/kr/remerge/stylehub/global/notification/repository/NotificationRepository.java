package kr.remerge.stylehub.global.notification.repository;

import kr.remerge.stylehub.global.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // 특정 유저의 알림 목록 (유저 직접 + 회사 + role 통합 조회)
    @Query("""
            SELECT n FROM Notification n
            WHERE n.targetUserId = :userId
               OR n.targetCompanyId = :companyId
               OR n.targetRole = :role
            ORDER BY n.createdAt DESC
            """)
    List<Notification> findByTarget(
            @Param("userId") Integer userId,
            @Param("companyId") Integer companyId,
            @Param("role") String role
    );

    // 읽지 않은 알림 수
    @Query("""
            SELECT COUNT(n) FROM Notification n
            WHERE (n.targetUserId = :userId
               OR n.targetCompanyId = :companyId
               OR n.targetRole = :role)
              AND n.isRead = false
            """)
    long countUnread(
            @Param("userId") Integer userId,
            @Param("companyId") Integer companyId,
            @Param("role") String role
    );
}
