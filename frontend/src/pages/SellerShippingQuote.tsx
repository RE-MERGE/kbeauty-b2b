import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Package, MapPin, Weight, Ruler, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const orderData: Record<string, any> = {
  "ORD-2024-KR-0524": {
    id: "ORD-2024-KR-0524",
    buyer: "글로벌뷰티㈜",
    product: "비타민C 세럼 30mL",
    quantity: "2,000개",
    destination: { country: "미국", city: "뉴욕" },
  },
  "ORD-2024-KR-0518": {
    id: "ORD-2024-KR-0518",
    buyer: "KBeauty USA Inc",
    product: "시트 마스크 세트",
    quantity: "10,000개",
    destination: { country: "캐나다", city: "토론토" },
  },
  "ORD-2024-KR-0501": {
    id: "ORD-2024-KR-0501",
    buyer: "뷰티월드",
    product: "쿠션 파운데이션",
    quantity: "2,500개",
    destination: { country: "일본", city: "도쿄" },
  },
};

export function SellerShippingQuote() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId") || "ORD-2024-KR-0524";
  const order = orderData[orderId] || orderData["ORD-2024-KR-0524"];

  const [formData, setFormData] = useState({
    orderId: order.id,
    warehouseCode: "",
    destinationCountry: order.destination.country,
    destinationCity: order.destination.city,
    actualWeight: "",
    width: "",
    height: "",
    depth: "",
  });

  const [volumeWeight, setVolumeWeight] = useState<number>(0);

  useEffect(() => {
    const { width, height, depth } = formData;
    if (width && height && depth) {
      const w = parseFloat(width);
      const h = parseFloat(height);
      const d = parseFloat(depth);
      if (!isNaN(w) && !isNaN(h) && !isNaN(d)) {
        const vol = (w * h * d) / 5000;
        setVolumeWeight(Math.round(vol * 100) / 100);
      }
    } else {
      setVolumeWeight(0);
    }
  }, [formData.width, formData.height, formData.depth]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("배송 견적서가 바이어에게 발송되었습니다!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          to="/mypage"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">마이페이지로 돌아가기</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-400 rounded-full mb-4 shadow-lg">
            <Package className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">배송 견적서 작성</h1>
          <p className="text-gray-600">배송 정보를 입력하여 바이어에게 배송 견적을 제공하세요</p>
        </div>

        {/* Order Info Card */}
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-3xl p-6 mb-6 border border-pink-200">
          <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Package size={18} className="text-pink-600" />
            주문 정보
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">바이어</span>
              <div className="font-semibold text-gray-800 mt-0.5">{order.buyer}</div>
            </div>
            <div>
              <span className="text-gray-600">제품</span>
              <div className="font-semibold text-gray-800 mt-0.5">{order.product}</div>
            </div>
            <div>
              <span className="text-gray-600">수량</span>
              <div className="font-semibold text-gray-800 mt-0.5">{order.quantity}</div>
            </div>
            <div>
              <span className="text-gray-600">배송지</span>
              <div className="font-semibold text-gray-800 mt-0.5">{order.destination.country}, {order.destination.city}</div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
          {/* Order ID */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">주문 번호</label>
            <div className="relative">
              <input
                type="text"
                value={formData.orderId}
                readOnly
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-pink-100 text-pink-600 text-xs px-3 py-1 rounded-full font-semibold">
                자동생성
              </div>
            </div>
          </div>

          {/* Warehouse Code */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">창고 코드</label>
            <select
              value={formData.warehouseCode}
              onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
              required
              className="w-full px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
            >
              <option value="">창고를 선택하세요</option>
              <option value="WH-KR-001">WH-KR-001 (서울 강남)</option>
              <option value="WH-KR-002">WH-KR-002 (인천 공항)</option>
              <option value="WH-KR-003">WH-KR-003 (부산 항구)</option>
              <option value="WH-KR-004">WH-KR-004 (경기 평택)</option>
            </select>
          </div>

          {/* Destination */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <MapPin size={16} className="text-pink-500" />
              배송 목적지
            </label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="국가"
                value={formData.destinationCountry}
                onChange={(e) => setFormData({ ...formData, destinationCountry: e.target.value })}
                required
                className="px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
              />
              <input
                type="text"
                placeholder="도시"
                value={formData.destinationCity}
                onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                required
                className="px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Actual Weight */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Weight size={16} className="text-pink-500" />
              실제 중량 (kg)
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.actualWeight}
              onChange={(e) => setFormData({ ...formData, actualWeight: e.target.value })}
              required
              className="w-full px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all"
            />
          </div>

          {/* Dimensions */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Ruler size={16} className="text-pink-500" />
              박스 크기 (cm)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <input
                type="number"
                step="0.1"
                placeholder="가로"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                required
                className="px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all text-center"
              />
              <input
                type="number"
                step="0.1"
                placeholder="세로"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                required
                className="px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all text-center"
              />
              <input
                type="number"
                step="0.1"
                placeholder="높이"
                value={formData.depth}
                onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
                required
                className="px-4 py-3 border border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all text-center"
              />
            </div>
          </div>

          {/* Volume Weight Display */}
          <div className="mb-8 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-4 border border-pink-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">부피 중량 (자동 계산)</span>
              <span className="text-2xl font-bold text-pink-600">
                {volumeWeight > 0 ? `${volumeWeight} kg` : "—"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              공식: (가로 × 세로 × 높이) ÷ 5000
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg"
          >
            <Send size={20} />
            바이어에게 견적서 발송
          </button>
        </form>
      </div>
    </div>
  );
}
