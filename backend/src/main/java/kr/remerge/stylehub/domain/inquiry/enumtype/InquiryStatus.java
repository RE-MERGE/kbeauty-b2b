package kr.remerge.stylehub.domain.inquiry.enumtype;

public enum InquiryStatus {
    OPEN,      // 문의 접수
    WAITING,   // 답변 대기 또는 추가 확인 중
    ANSWERED,  // 답변 완료
    CLOSED     // 문의 종료
}