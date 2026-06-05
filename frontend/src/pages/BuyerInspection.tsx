import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Package, CheckCircle2, AlertTriangle, XCircle, CreditCard, MessageCircle, ZoomIn, X } from "lucide-react";
import { Button } from "../app/components/ui/button";
import { Badge } from "../app/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../app/components/ui/dialog";
import { toast } from "sonner";

export function BuyerInspection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-2024-001";

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Mock inspection data
  const inspectionData = {
    orderId,
    productName: "설화수 윤조에센스 60ml x 10개",
    orderedQuantity: 10,
    actualQuantity: 10,
    damageStatus: "normal", // "normal" | "partial-damage" | "wrong-delivery"
    inspectionDate: "2026-06-01 14:30",
    photos: [
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400",
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400",
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
    ],
    shippingFee: 45.50,
  };

  const getStatusBadge = () => {
    switch (inspectionData.damageStatus) {
      case "normal":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            <CheckCircle2 size={14} className="mr-1" />
            정상
          </Badge>
        );
      case "partial-damage":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">
            <AlertTriangle size={14} className="mr-1" />
            일부 파손
          </Badge>
        );
      case "wrong-delivery":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
            <XCircle size={14} className="mr-1" />
            오배송
          </Badge>
        );
      default:
        return null;
    }
  };

  const handlePayShipping = () => {
    toast.success("배송비 결제 페이지로 이동합니다");
    setTimeout(() => {
      navigate("/checkout");
    }, 1000);
  };

  const handleDispute = () => {
    toast.success("고객센터로 문의가 접수되었습니다");
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <Package size={32} />
          <h1 className="text-3xl font-bold">창고 검수 결과</h1>
        </div>
        <p className="text-white/90">창고에 도착한 제품의 검수 결과를 확인하세요</p>
      </div>

      {/* Order Information */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-bold">주문 정보</h2>
          {getStatusBadge()}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">주문번호</div>
            <div className="font-mono font-semibold">{inspectionData.orderId}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">검수 완료 일시</div>
            <div className="font-semibold">{inspectionData.inspectionDate}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground mb-1">주문 상품</div>
            <div className="font-semibold">{inspectionData.productName}</div>
          </div>
        </div>
      </div>

      {/* Inspection Results */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">검수 결과</h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-secondary rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">주문 수량</div>
            <div className="text-3xl font-bold text-foreground">{inspectionData.orderedQuantity}개</div>
          </div>
          <div className="bg-secondary rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">실제 도착 수량</div>
            <div className="text-3xl font-bold text-foreground">{inspectionData.actualQuantity}개</div>
          </div>
        </div>

        {inspectionData.orderedQuantity !== inspectionData.actualQuantity && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">수량 불일치</h3>
                <p className="text-sm text-orange-800">
                  주문 수량과 실제 도착 수량이 다릅니다. 하단의 "이의제기 및 보상 신청" 버튼을 눌러주세요.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-2">
          <h3 className="font-semibold mb-3">검수 사진</h3>
          <div className="grid grid-cols-3 gap-4">
            {inspectionData.photos.map((photo, idx) => (
              <div
                key={idx}
                className="relative rounded-lg overflow-hidden border border-border cursor-pointer hover:opacity-90 transition-opacity group"
                onClick={() => setSelectedImage(photo)}
              >
                <img src={photo} alt={`검수 사진 ${idx + 1}`} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <ZoomIn size={32} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons - Conditional based on status */}
      {inspectionData.damageStatus === "normal" && inspectionData.orderedQuantity === inspectionData.actualQuantity ? (
        // Normal case: show shipping payment
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <CheckCircle2 size={32} className="text-green-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-2">검수가 정상적으로 완료되었습니다</h3>
              <p className="text-sm text-green-800 mb-4">
                모든 제품이 정상적으로 도착했습니다. 해외 배송비를 결제하시면 배송이 시작됩니다.
              </p>
              <div className="bg-white rounded-lg p-4 mb-4 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">해외 배송비</div>
                    <div className="text-2xl font-bold text-foreground">${inspectionData.shippingFee.toFixed(2)}</div>
                  </div>
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90"
                    onClick={handlePayShipping}
                  >
                    <CreditCard size={18} className="mr-2" />
                    배송비 결제하기
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Issue case: show dispute button
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <AlertTriangle size={32} className="text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900 mb-2">이상이 발견되었습니다</h3>
              <p className="text-sm text-orange-800 mb-4">
                파손 또는 수량 부족이 확인되었습니다. 셀러에게 반품/환불을 요청하거나 고객센터에 문의하실 수 있습니다.
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-orange-600 text-orange-600 hover:bg-orange-100"
                  onClick={handleDispute}
                >
                  <MessageCircle size={18} className="mr-2" />
                  이의제기 및 보상 신청
                </Button>
                <Button variant="outline" onClick={() => navigate("/support")}>
                  고객센터 문의
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => navigate("/orders")}>
          주문 내역으로 돌아가기
        </Button>
      </div>

      {/* Image Viewer Dialog */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>검수 사진 확대보기</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {selectedImage && (
              <img src={selectedImage} alt="검수 사진 확대" className="w-full h-auto rounded-lg" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
              onClick={() => setSelectedImage(null)}
            >
              <X size={20} />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
