import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  AlertCircle,
  FileText,
  MessageSquare,
  MapPin,
  RotateCcw,
  Send,
  Printer,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "결제 대기",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock size={14} />,
  },
  CONFIRMED: {
    label: "주문 확인",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <CheckCircle size={14} />,
  },
  PREPARING: {
    label: "준비 중",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: <Package size={14} />,
  },
  SHIPPED: {
    label: "배송 중",
    color: "text-primary",
    bg: "bg-secondary border-primary/20",
    icon: <Truck size={14} />,
  },
  DELIVERED: {
    label: "배송 완료",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle size={14} />,
  },
  CANCELLED: {
    label: "취소됨",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle size={14} />,
  },
};

const SHIPPING_COMPANIES = [
  "CJ대한통운",
  "롯데택배",
  "한진택배",
  "로젠택배",
  "우체국택배",
];

type SizeItem = {
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
};

const ordersData: Record<
  string,
  {
    id: string;
    date: string;
    buyerName: string;
    buyerBusiness: string;
    buyerPhone: string;
    status: OrderStatus;
    trackingNo: string | null;
    trackingCompany: string | null;
    items: {
      productName: string;
      image: string;
      sizes: SizeItem[];
    }[];
    shippingFee: number;
    isFreeShipping: boolean;
    address: {
      recipient: string;
      phone: string;
      address: string;
      detail: string;
    };
    paymentMethod: string;
    notes?: string;
    returnRequest?: {
      type: "반품" | "교환";
      reason: string;
      detail: string;
      requestedAt: string;
      status: "접수" | "처리중" | "완료";
    };
  }
> = {
  "ORD-2024-0841": {
    id: "ORD-2024-0841",
    date: "2024.05.14",
    buyerName: "김민재",
    buyerBusiness: "스타일마켓㈜",
    buyerPhone: "010-1234-5678",
    status: "PREPARING",
    trackingNo: null,
    trackingCompany: null,
    items: [
      {
        productName: "여성 린넨 오버핏 블라우스",
        image:
          "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=160&h=160&fit=crop&auto=format",
        sizes: [
          { size: "S", color: "화이트", quantity: 10, unitPrice: 12000 },
          { size: "M", color: "화이트", quantity: 20, unitPrice: 12000 },
          { size: "L", color: "화이트", quantity: 15, unitPrice: 12000 },
          { size: "M", color: "베이지", quantity: 15, unitPrice: 12000 },
          { size: "L", color: "베이지", quantity: 10, unitPrice: 12000 },
        ],
      },
      {
        productName: "와이드 린넨 슬랙스",
        image:
          "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=160&h=160&fit=crop&auto=format",
        sizes: [
          { size: "S", color: "아이보리", quantity: 10, unitPrice: 18000 },
          { size: "M", color: "아이보리", quantity: 15, unitPrice: 18000 },
        ],
      },
    ],
    shippingFee: 0,
    isFreeShipping: true,
    address: {
      recipient: "김민재",
      phone: "010-1234-5678",
      address: "서울특별시 마포구 합정동 123-4",
      detail: "스타일마켓㈜ 1층",
    },
    paymentMethod: "계좌이체",
    notes: "포장 꼼꼼하게 부탁드립니다.",
  },
  "ORD-2024-0799": {
    id: "ORD-2024-0799",
    date: "2024.05.10",
    buyerName: "박지수",
    buyerBusiness: "온라인샵 패션픽",
    buyerPhone: "010-9876-5432",
    status: "SHIPPED",
    trackingNo: "598412873021",
    trackingCompany: "CJ대한통운",
    items: [
      {
        productName: "플리츠 미디 스커트",
        image:
          "https://images.unsplash.com/photo-1583496661160-fb5886a13d27?w=160&h=160&fit=crop&auto=format",
        sizes: [
          { size: "S", color: "블랙", quantity: 10, unitPrice: 15000 },
          { size: "M", color: "블랙", quantity: 20, unitPrice: 15000 },
          { size: "M", color: "그레이", quantity: 15, unitPrice: 15000 },
        ],
      },
    ],
    shippingFee: 3000,
    isFreeShipping: false,
    address: {
      recipient: "박지수",
      phone: "010-9876-5432",
      address: "경기도 성남시 분당구 판교로 235",
      detail: "패션픽 사무실",
    },
    paymentMethod: "기업카드",
    returnRequest: {
      type: "교환",
      reason: "사이즈 불일치",
      detail:
        "M 사이즈가 실제로 너무 작게 나온 것 같습니다. L 사이즈로 교환 요청드립니다.",
      requestedAt: "2024.05.13 14:22",
      status: "접수",
    },
  },
};

export function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = id ? ordersData[id] : null;

  const [trackingCompany, setTrackingCompany] = useState("");
  const [trackingNo, setTrackingNo] = useState("");
  const [showTrackingForm, setShowTrackingForm] = useState(false);
  const [shipped, setShipped] = useState(false);

  const handlePdfPrint = () => {
    window.print();
  };

  if (!order) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
        <Package
          size={48}
          className="mx-auto mb-4 opacity-30 text-muted-foreground"
        />
        <h2 className="text-xl font-bold text-foreground mb-2">
          주문을 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground mb-5">주문번호를 확인해 주세요.</p>
        <Link
          to="/seller/orders"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors"
        >
          주문 목록으로
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status];

  const totalQty = order.items.reduce(
    (sum, item) => sum + item.sizes.reduce((s, sz) => s + sz.quantity, 0),
    0
  );

  const subtotal = order.items.reduce(
    (sum, item) =>
      sum + item.sizes.reduce((s, sz) => s + sz.quantity * sz.unitPrice, 0),
    0
  );

  const total = subtotal + (order.isFreeShipping ? 0 : order.shippingFee);

  const handleShip = () => {
    if (!trackingCompany || !trackingNo) return;
    setShipped(true);
    setShowTrackingForm(false);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <Link
        to="/seller/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
      >
        <ChevronLeft size={14} />
        주문 목록으로
      </Link>

      <div className="bg-gradient-to-r from-[#1a2e1a] to-[#2d4a35] text-white rounded-lg p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold font-mono">{order.id}</h1>
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-white/90 ${status.color}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span>주문일: {order.date}</span>
              <span>
                바이어:{" "}
                <span className="text-white font-medium">
                  {order.buyerBusiness}
                </span>
              </span>
              {(order.trackingNo || shipped) && (
                <span className="font-mono text-white/90">
                  {order.trackingCompany ?? trackingCompany}{" "}
                  {order.trackingNo ?? trackingNo}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              ₩{total.toLocaleString()}
            </div>
            <div className="text-xs text-white/60 mt-0.5">
              총 {totalQty.toLocaleString()}장
            </div>
          </div>
        </div>
      </div>

      {order.returnRequest && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-5 flex items-start gap-3">
          <RotateCcw size={16} className="text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-800 mb-0.5">
              {order.returnRequest.type} 요청이 접수되었습니다
            </p>
            <p className="text-xs text-red-700">
              사유: {order.returnRequest.reason} ·{" "}
              {order.returnRequest.requestedAt}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {order.returnRequest.detail}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="text-xs border border-red-300 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded transition-colors font-medium">
              거절
            </button>
            <button className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded transition-colors font-medium">
              승인 처리
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5">
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Package size={16} className="text-primary" />
                주문 상품
              </h2>
            </div>

            <div className="divide-y divide-border">
              {order.items.map((item, ii) => {
                const itemTotal = item.sizes.reduce(
                  (s, sz) => s + sz.quantity * sz.unitPrice,
                  0
                );
                const itemQty = item.sizes.reduce(
                  (s, sz) => s + sz.quantity,
                  0
                );

                return (
                  <div key={ii} className="px-5 py-4">
                    <div className="flex items-start gap-4 mb-4">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-24 h-24 rounded-lg object-cover border border-border flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-foreground text-sm">
                              {item.productName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              컬러·사이즈 옵션 {item.sizes.length}개
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-foreground text-sm">
                              ₩{itemTotal.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {itemQty}장
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-muted-foreground font-medium pb-1.5 pr-4">
                              컬러
                            </th>
                            <th className="text-left text-muted-foreground font-medium pb-1.5 pr-4">
                              사이즈
                            </th>
                            <th className="text-right text-muted-foreground font-medium pb-1.5 pr-4">
                              수량
                            </th>
                            <th className="text-right text-muted-foreground font-medium pb-1.5 pr-4">
                              단가
                            </th>
                            <th className="text-right text-muted-foreground font-medium pb-1.5">
                              금액
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.sizes.map((sz, si) => (
                            <tr
                              key={si}
                              className="border-b border-border/40 last:border-0"
                            >
                              <td className="py-1.5 pr-4 text-foreground">
                                {sz.color}
                              </td>
                              <td className="py-1.5 pr-4 font-medium text-foreground">
                                {sz.size}
                              </td>
                              <td className="py-1.5 pr-4 text-right text-foreground">
                                {sz.quantity}장
                              </td>
                              <td className="py-1.5 pr-4 text-right text-muted-foreground">
                                ₩{sz.unitPrice.toLocaleString()}
                              </td>
                              <td className="py-1.5 text-right font-medium text-foreground">
                                ₩
                                {(
                                  sz.quantity * sz.unitPrice
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-muted/30 px-5 py-4 border-t border-border space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">상품 금액</span>
                <span>₩{subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  택배비
                  {order.isFreeShipping && (
                    <span className="ml-1.5 text-xs text-green-600 font-medium">
                      무료배송
                    </span>
                  )}
                </span>
                <span>
                  {order.isFreeShipping
                    ? "₩0"
                    : `₩${order.shippingFee.toLocaleString()}`}
                </span>
              </div>

              <div className="flex justify-between font-bold pt-2 border-t border-border text-base">
                <span className="text-foreground">합계</span>
                <span className="text-foreground">
                  ₩{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {(order.status === "CONFIRMED" || order.status === "PREPARING") &&
            !shipped && (
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h2 className="font-bold text-foreground flex items-center gap-2">
                    <Truck size={16} className="text-primary" />
                    출고 처리
                  </h2>
                </div>

                <div className="p-5">
                  {!showTrackingForm ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        포장 완료 후 송장 번호를 입력해 주세요.
                      </p>
                      <button
                        onClick={() => setShowTrackingForm(true)}
                        className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2 rounded transition-colors flex items-center gap-2"
                      >
                        <Send size={14} />
                        송장 입력
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            택배사
                          </label>
                          <select
                            value={trackingCompany}
                            onChange={(e) =>
                              setTrackingCompany(e.target.value)
                            }
                            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                          >
                            <option value="">선택</option>
                            {SHIPPING_COMPANIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            송장 번호
                          </label>
                          <input
                            type="text"
                            value={trackingNo}
                            onChange={(e) => setTrackingNo(e.target.value)}
                            placeholder="숫자만 입력"
                            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setShowTrackingForm(false)}
                          className="border border-border text-foreground hover:border-primary hover:text-primary text-sm px-4 py-2 rounded transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={handleShip}
                          disabled={!trackingCompany || !trackingNo}
                          className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
                        >
                          발송 처리
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {shipped && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-600" />
              <div>
                <p className="text-sm font-semibold text-green-800">
                  발송 처리 완료
                </p>
                <p className="text-xs text-green-700 font-mono">
                  {trackingCompany} {trackingNo}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-4 text-sm">
              주문 관리
            </h3>

            <div className="space-y-2">
              <button
                onClick={handlePdfPrint}
                className="w-full bg-primary hover:bg-primary/90 text-white text-sm px-4 py-2.5 rounded font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <Printer size={14} />
                주문 상세 PDF 저장
              </button>

              <button className="w-full border border-border text-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                <FileText size={14} />
                거래명세서 출력
              </button>

              <button className="w-full border border-border text-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={14} />
                바이어 문의
              </button>

              {order.status === "CONFIRMED" && (
                <button className="w-full border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2.5 rounded font-medium transition-colors">
                  주문 취소 처리
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-3 text-sm">
              바이어 정보
            </h3>
            <div className="space-y-1.5 text-sm">
              <div className="font-semibold text-foreground">
                {order.buyerBusiness}
              </div>
              <div className="text-muted-foreground">{order.buyerName}</div>
              <div className="text-muted-foreground">{order.buyerPhone}</div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              배송지
            </h3>
            <div className="text-sm space-y-1">
              <div className="font-semibold text-foreground">
                {order.address.recipient}
              </div>
              <div className="text-muted-foreground">{order.address.phone}</div>
              <div className="text-muted-foreground">
                {order.address.address}
              </div>
              <div className="text-xs text-muted-foreground">
                {order.address.detail}
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-3 text-sm">
              결제 정보
            </h3>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">결제 수단</span>
                <span className="font-medium text-foreground">
                  {order.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">결제 금액</span>
                <span className="font-medium text-foreground">
                  ₩{total.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">정산 예정</span>
                <span className="font-medium text-green-700">
                  구매 확정 후
                </span>
              </div>
            </div>

            {order.notes && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  {order.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}