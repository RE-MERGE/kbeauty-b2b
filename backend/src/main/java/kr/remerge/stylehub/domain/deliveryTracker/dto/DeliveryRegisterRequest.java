package kr.remerge.stylehub.domain.deliveryTracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DeliveryRegisterRequest(
        @NotNull Integer orderId,
        @NotBlank String carrierId,       // DeliveryTracker carrier ID (ex: kr.cjlogistics)
        @NotBlank String carrierName,     // 택배사 한글명 (ex: CJ대한통운) — order.carrier에 저장
        @NotBlank String trackingNumber
) {}
