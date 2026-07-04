package kr.remerge.stylehub.domain.support.inquiry.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.company.entity.Company;
import kr.remerge.stylehub.domain.support.enumtype.FaqCategory;
import kr.remerge.stylehub.domain.support.inquiry.enumtype.InquiryStatus;
import kr.remerge.stylehub.domain.user.entity.User;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "inquiries")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Inquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "inquiry_id")
    private Integer inquiryId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "last_sender_id")
    private User lastSender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private FaqCategory category;

    @Column(nullable = false, length = 100)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InquiryStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_admin_id")
    private User assignedAdmin;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @Column(name = "last_message_preview", length = 255)
    private String lastMessagePreview;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Builder
    public Inquiry(Company company, User createdByUser, FaqCategory category, String title) {
        this.company = company;
        this.createdByUser = createdByUser;
        this.category = category;
        this.title = title;
        this.status = InquiryStatus.OPEN;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // ───────────────────────────────────────────
    // 도메인 비즈니스 메서드 (Domain Methods)
    // ───────────────────────────────────────────

    public void assignAdmin(User admin) {
        this.assignedAdmin = admin;
    }

    /**
     * 최신 메시지 업데이트 및 방 상태 변경
     */
    public void updateLastMessage(User sender, String messageText) {
        this.lastSender = sender;
        this.lastMessageAt = LocalDateTime.now();

        // 프리뷰 글자수 제한(예: 80자) 처리 후 저장
        this.lastMessagePreview = (messageText != null && messageText.length() > 80)
                ? messageText.substring(0, 80) + "..."
                : messageText;

        // 권한 체크 로직 (보낸 사람이 담당 어드민인지 여부로 분기)
        if (this.assignedAdmin != null && sender.getUserId().equals(this.assignedAdmin.getUserId())) {
            this.status = InquiryStatus.ANSWERED;
        } else {
            this.status = InquiryStatus.WAITING;
        }
    }

    public void close() {
        this.status = InquiryStatus.CLOSED;
        this.closedAt = LocalDateTime.now();
    }
}