package kr.remerge.stylehub.domain.order.dto.seller;

public record SellerOrderPreparationResponse(
        long totalItemCount,
        long readyItemCount,
        boolean allItemsReady
) {

    public static SellerOrderPreparationResponse from(long totalItemCount, long readyItemCount, boolean allItemsReady) {

        return new SellerOrderPreparationResponse(
                totalItemCount,
                readyItemCount,
                allItemsReady
        );

    }
}
