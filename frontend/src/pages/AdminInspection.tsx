import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Package, Upload, Save, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "../app/components/ui/button";
import { Input } from "../app/components/ui/input";
import { Label } from "../app/components/ui/label";
import { Textarea } from "../app/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../app/components/ui/select";
import { toast } from "sonner";

export function AdminInspection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-2024-001";

  const [formData, setFormData] = useState({
    actualQuantity: "",
    damageStatus: "normal",
    internalMemo: "",
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
      toast.success(`${files.length}장의 사진이 업로드되었습니다`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.actualQuantity) {
      toast.error("실제 도착 수량을 입력해주세요");
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error("최소 1장 이상의 검수 사진을 업로드해주세요");
      return;
    }

    // 실제로는 여기서 S3 업로드 및 SES 이메일 발송 로직이 실행됩니다
    toast.success("검수가 완료되었습니다. 바이어에게 알림 이메일이 발송되었습니다.");

    setTimeout(() => {
      navigate("/admin/dashboard");
    }, 1500);
  };

  const orderInfo = {
    orderId,
    buyerName: "김바이어",
    productName: "설화수 윤조에센스 60ml x 10개",
    orderedQuantity: 10,
    arrivalDate: "2026-06-01",
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Package size={32} />
              <h1 className="text-3xl font-bold">창고 검수 입력</h1>
            </div>
            <p className="text-white/90">도착한 제품의 실제 수량과 상태를 기록하고 사진을 업로드하세요</p>
          </div>
          <Button
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            onClick={() => navigate("/admin/dashboard")}
          >
            <ArrowLeft size={18} className="mr-2" />
            대시보드로
          </Button>
        </div>
      </div>

      {/* Order Information */}
      <div className="bg-white border border-border rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-primary" />
          주문 정보
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">주문번호</div>
            <div className="font-mono font-semibold">{orderInfo.orderId}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">바이어</div>
            <div className="font-semibold">{orderInfo.buyerName}</div>
          </div>
          <div className="col-span-2">
            <div className="text-sm text-muted-foreground mb-1">주문 상품</div>
            <div className="font-semibold">{orderInfo.productName}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">주문 수량</div>
            <div className="font-semibold">{orderInfo.orderedQuantity}개</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">창고 도착일</div>
            <div className="font-semibold">{orderInfo.arrivalDate}</div>
          </div>
        </div>
      </div>

      {/* Inspection Form */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">검수 결과 입력</h2>

          <div className="space-y-6">
            {/* Actual Quantity */}
            <div>
              <Label htmlFor="actualQuantity" className="mb-2 block">
                실제 도착 수량 *
              </Label>
              <Input
                id="actualQuantity"
                type="number"
                placeholder="실제 도착한 수량을 입력하세요"
                value={formData.actualQuantity}
                onChange={(e) => setFormData({ ...formData, actualQuantity: e.target.value })}
                className="max-w-xs"
                min="0"
              />
              <p className="text-sm text-muted-foreground mt-1">
                주문 수량: {orderInfo.orderedQuantity}개
              </p>
            </div>

            {/* Damage Status */}
            <div>
              <Label htmlFor="damageStatus" className="mb-2 block">
                파손 여부 *
              </Label>
              <Select
                value={formData.damageStatus}
                onValueChange={(value) => setFormData({ ...formData, damageStatus: value })}
              >
                <SelectTrigger className="max-w-xs" id="damageStatus">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">정상</SelectItem>
                  <SelectItem value="partial-damage">일부 파손</SelectItem>
                  <SelectItem value="wrong-delivery">오배송</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload */}
            <div>
              <Label htmlFor="photos" className="mb-2 block">
                검수 사진 업로드 *
              </Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                <Upload size={40} className="mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  클릭하여 사진을 업로드하거나 드래그 앤 드롭하세요
                </p>
                <Input
                  id="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("photos")?.click()}
                >
                  파일 선택
                </Button>
              </div>

              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-4">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative rounded-lg overflow-hidden border border-border">
                      <img src={img} alt={`검수 사진 ${idx + 1}`} className="w-full h-32 object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                      >
                        삭제
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Internal Memo */}
            <div>
              <Label htmlFor="internalMemo" className="mb-2 block">
                내부 메모 (바이어에게 보이지 않음)
              </Label>
              <Textarea
                id="internalMemo"
                placeholder="창고 직원들만의 특이사항을 기록하세요 (예: 박스 모서리가 심하게 찌그러져 왔음)"
                value={formData.internalMemo}
                onChange={(e) => setFormData({ ...formData, internalMemo: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        {formData.damageStatus !== "normal" && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle size={20} className="text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-destructive mb-1">주의 필요</h3>
              <p className="text-sm text-destructive/90">
                파손 또는 오배송 상품이 확인되었습니다. 검수 완료 시 바이어에게 자동으로 알림이 발송되며,
                바이어는 이의제기 또는 보상 신청을 할 수 있습니다.
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/admin/dashboard")}
          >
            취소
          </Button>
          <Button type="submit" className="bg-primary hover:bg-primary/90">
            <Save size={18} className="mr-2" />
            검수 완료 및 바이어에게 알림 발송
          </Button>
        </div>
      </form>
    </div>
  );
}
