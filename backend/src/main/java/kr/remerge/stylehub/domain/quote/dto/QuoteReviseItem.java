package kr.remerge.stylehub.domain.quote.dto;

// 협의(재견적 요청)에 대한 셀러 응답으로 새 버전의 견적을 만들 때 쓰는 품목 값.
// negotiation 도메인이 quote 도메인의 DTO(record)를 직접 참조하지 않도록
// 이 작은 값 객체를 quote.dto 패키지에 별도로 둔다.
public record QuoteReviseItem(
        String optionSummary,
        Integer quantity,
        Long unitPrice,
        Boolean sample
) {
}
