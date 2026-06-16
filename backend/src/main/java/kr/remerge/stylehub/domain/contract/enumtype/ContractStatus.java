package kr.remerge.stylehub.domain.contract.enumtype;

public enum ContractStatus {

    DRAFT,          // 계약서 초안 생성 상태
    SELLER_SIGNED,  // 셀러 서명 완료
    BUYER_SIGNED,   // 바이어 서명 완료
    COMPLETED,      // 양측 서명 완료 후 계약 확정
    CANCELED,       // 계약 취소
    EXPIRED         // 계약 유효기간 만료
}