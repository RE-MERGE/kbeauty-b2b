package kr.remerge.stylehub.domain.settlement.dto;
import lombok.*;

import java.time.LocalDateTime;

@Data
public class SettlementDto {
    private int settlement_id;

    private int seller_id;
    private int buyer_id;
    private int admin_id;
    private String order_no;

    private int total_amount;
    private int platform_fee;
    private int final_amount;
    private String status;

    private LocalDateTime settled_at;
    private LocalDateTime created_at;
    private String receiver_name;
}
