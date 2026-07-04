package kr.remerge.stylehub.global.notification.enumtype;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NotificationType {

    // ── 소싱 관련 ─────────────────────────────────────────────────────
    SOURCING_ASSIGNED("소싱 요청이 배정되었습니다."),          // 셀러 회사
    QUOTE_RECEIVED("새 견적이 도착했습니다."),                 // 바이어 회사
    QUOTE_APPROVED("견적이 채택되었습니다."),                  // 셀러 유저
    QUOTE_REJECTED("견적이 거절되었습니다."),                  // 셀러 유저
    QUOTE_NEGOTIATING("협의 요청이 도착했습니다."),            // 셀러 유저
    SAMPLE_REQUESTED("샘플 결제 요청이 도착했습니다."),        // 셀러 유저

    // ── 주문/배송 관련 ────────────────────────────────────────────────
    ORDER_CONFIRMED("주문이 확정되었습니다."),                 // 셀러 회사
    ORDER_SHIPPED("상품이 발송되었습니다."),                   // 바이어 회사
    ORDER_DELIVERED("배송이 완료되었습니다."),                 // 바이어 회사

    // ── 계약 관련 ─────────────────────────────────────────────────────
    CONTRACT_CREATED("계약서가 도착했습니다."),                // 바이어 회사
    CONTRACT_SIGNED("계약서 서명이 완료되었습니다."),          // 셀러 유저

    // ── 관리자 관련 ───────────────────────────────────────────────────
    USER_JOINED("새 회원이 가입했습니다."),                    // ADMIN role
    COMPANY_APPROVAL_REQUESTED("업체 승인 요청이 접수되었습니다."), // ADMIN role
    SOURCING_CREATED("새 소싱 요청이 등록되었습니다."),        // ADMIN role
    DISPUTE_RAISED("이의제기가 접수되었습니다.");              // ADMIN role

    private final String defaultMessage;
}
