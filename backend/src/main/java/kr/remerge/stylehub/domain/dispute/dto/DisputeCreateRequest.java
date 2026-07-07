package kr.remerge.stylehub.domain.dispute.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import kr.remerge.stylehub.domain.dispute.enumtype.DisputeType;
import kr.remerge.stylehub.domain.dispute.enumtype.RequestedAction;

import java.util.List;

public record DisputeCreateRequest(

        @NotNull(message = "이의제기 유형을 선택해 주세요.")
        DisputeType disputeType,

        @NotBlank(message = "이의제기 내용을 입력해 주세요.")
        @Size(max = 2000, message = "이의제기 내용은 2000자 이하여야 합니다.")
        String buyerClaim,

        @NotNull(message = "요청 처리 방법을 선택해 주세요.")
        RequestedAction requestedAction,

        List<@Valid Item> items
) {
    public record Item(

            @NotNull(message = "주문 상품을 선택해 주세요.")
            Integer orderItemId,

            @NotNull(message = "문제 수량을 입력해 주세요.")
            @Positive(message = "문제 수량은 1개 이상이어야 합니다.")
            Integer claimQuantity,

            @NotBlank(message = "상품별 문제 사유를 입력해 주세요.")
            @Size(max = 1000, message = "상품별 문제 사유는 1000자 이하여야 합니다.")
            String claimReason
    ) {
    }
}
