package kr.remerge.stylehub.domain.deliveryTracker.enumtype;

public enum DeliveryStatus {
    REGISTERED("운송장 등록"),
    PICKED_UP("수거 완료"),
    IN_TRANSIT("배송 중"),
    OUT_FOR_DELIVERY("배송 출발"),
    DELIVERED("배송 완료"),
    ATTEMPT_FAIL("배송 실패"),
    EXCEPTION("배송 예외"),
    EXPIRED("만료");

    private final String label;

    DeliveryStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    // DeliveryTracker status.code → DeliveryStatus 변환
    public static DeliveryStatus from(String code) {
        return switch (code) {
            case "INFORMATION_RECEIVED" -> REGISTERED;
            case "AT_PICKUP"            -> PICKED_UP;
            case "IN_TRANSIT"           -> IN_TRANSIT;
            case "OUT_FOR_DELIVERY"     -> OUT_FOR_DELIVERY;
            case "DELIVERED"            -> DELIVERED;
            case "ATTEMPT_FAIL"         -> ATTEMPT_FAIL;
            case "EXCEPTION"            -> EXCEPTION;
            case "EXPIRED"              -> EXPIRED;
            default -> IN_TRANSIT; // 알 수 없는 코드는 안전하게 IN_TRANSIT으로
        };
    }
}
