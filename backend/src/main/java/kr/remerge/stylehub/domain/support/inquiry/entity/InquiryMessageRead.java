package kr.remerge.stylehub.domain.support.inquiry.entity;

import jakarta.persistence.*;
import kr.remerge.stylehub.domain.user.entity.User;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(
        name = "inquiry_message_reads",
        indexes = {
                @Index(name = "idx_message_user", columnList = "message_id, user_id")
        }
)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class InquiryMessageRead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_read_id")
    private Integer messageReadId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    private InquiryMessage message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Builder
    public InquiryMessageRead(InquiryMessage message, User user) {
        this.message = message;
        this.user = user;
    }

    @PrePersist
    protected void onCreate() {
        this.readAt = LocalDateTime.now();
    }
}