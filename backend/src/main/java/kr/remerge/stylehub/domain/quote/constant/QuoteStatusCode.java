package kr.remerge.stylehub.domain.quote.constant;

public final class QuoteStatusCode {

    // 셀러가 견적서를 제출한 상태
    public static final String SUBMITTED = "SUBMITTED";

    // 바이어가 견적 조건 협의를 요청한 상태
    public static final String NEGOTIATING = "NEGOTIATING";

    // 바이어가 샘플 진행을 요청한 상태
    public static final String SAMPLE_REQUESTED = "SAMPLE_REQUESTED";

    // 바이어가 견적을 채택한 상태
    public static final String APPROVED = "APPROVED";

    // 바이어가 견적을 거절한 상태
    public static final String REJECTED = "REJECTED";

    // 견적 유효기간이 만료된 상태
    public static final String EXPIRED = "EXPIRED";

    // 다른 견적이 채택되지 않은 상태
    public static final String NOT_SELECTED = "NOT_SELECTED";

    private QuoteStatusCode() {
    }
}