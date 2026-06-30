package kr.remerge.stylehub.domain.sourcing.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingRequest;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingRequestFile;
import kr.remerge.stylehub.domain.sourcing.entity.SourcingRequestItem;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class SourcingRequestSellerDetailResponse {

    @JsonProperty("sourcing_request_id")
    private Integer sourcingRequestId;

    @JsonProperty("sourcing_no")
    private String sourcingNo;

    private String type;
    private String status;

    @JsonProperty("product_name")
    private String productName;

    @JsonProperty("brand_name")
    private String brandName;

    @JsonProperty("sub_category_id")
    private Integer subCategoryId;

    @JsonProperty("need_sample")
    private String needSample;

    @JsonProperty("main_material")
    private String mainMaterial;

    @JsonProperty("unit_price")
    private Long unitPrice;

    @JsonProperty("ref_url")
    private String refUrl;

    @JsonProperty("total_budget")
    private Long totalBudget;

    private String detail;

    @JsonProperty("delivery_date")
    private String deliveryDate;

    @JsonProperty("expiry_date")
    private String expiryDate;

    @JsonProperty("created_at")
    private String createdAt;

    private List<ItemDto> items;
    private List<FileDto> files;

    @Getter
    @Builder
    public static class ItemDto {
        @JsonProperty("sourcing_request_item_id")
        private Integer sourcingRequestItemId;
        @JsonProperty("option_summary")
        private String optionSummary;
        private Integer quantity;
        @JsonProperty("sample_quantity")
        private Integer sampleQuantity;
    }

    @Getter
    @Builder
    public static class FileDto {
        @JsonProperty("sourcing_request_file_id")
        private Integer sourcingRequestFileId;
        @JsonProperty("file_type")
        private String fileType;
        @JsonProperty("file_name")
        private String fileName;
        @JsonProperty("file_url")
        private String fileUrl;
    }

    public static SourcingRequestSellerDetailResponse from(
            SourcingRequest request,
            List<SourcingRequestItem> items,
            List<SourcingRequestFile> files
    ) {
        return SourcingRequestSellerDetailResponse.builder()
                .sourcingRequestId(request.getSourcingRequestId())
                .sourcingNo(request.getSourcingNo())
                .type(request.getType())
                .status(request.getStatus().name())
                .productName(request.getProductName())
                .brandName(request.getBrandName())
                .subCategoryId(request.getSubCategoryId())
                .needSample(request.getNeedSample())
                .mainMaterial(request.getMainMaterial())
                .unitPrice(request.getUnitPrice())
                .refUrl(request.getRefUrl())
                .totalBudget(request.getTotalBudget())
                .detail(request.getDetail())
                .deliveryDate(request.getDeliveryDate() != null ? request.getDeliveryDate().toString() : null)
                .expiryDate(request.getExpiryDate() != null ? request.getExpiryDate().toString() : null)
                .createdAt(request.getCreatedAt().toString())
                .items(items.stream()
                        .map(i -> ItemDto.builder()
                                .sourcingRequestItemId(i.getSourcingRequestItemId())
                                .optionSummary(i.getOptionSummary())
                                .quantity(i.getQuantity())
                                .sampleQuantity(i.getSampleQuantity())
                                .build())
                        .toList())
                .files(files.stream()
                        .map(f -> FileDto.builder()
                                .sourcingRequestFileId(f.getSourcingRequestFileId())
                                .fileType(f.getFileType())
                                .fileName(f.getFileName())
                                .fileUrl(f.getFileUrl())
                                .build())
                        .toList())
                .build();
    }
}
