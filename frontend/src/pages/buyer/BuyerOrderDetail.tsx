import { useState } from "react";
import { useParams, Link } from "react-router";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronLeft,
  FileText,
  Download,
  MapPin,
  AlertCircle,
  RefreshCw,
  MessageSquare,
  RotateCcw,
  Star,
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
    brandName: string;
    brandId: string;
    status: OrderStatus;
    trackingNo: string | null;
    trackingCompany: string | null;
    items: { productName: string; image: string; sizes: SizeItem[] }[];
    shippingFee: number;
    isFreeShipping: boolean;
    shippingSteps: { status: string; time: string; done: boolean }[];
    address: {
      recipient: string;
      phone: string;
      address: string;
      detail: string;
    };
    paymentMethod: string;
    notes?: string;
    returnDeadline: string;
    canReturn: boolean;
    reviewed: boolean;
  }
> = {
  "ORD-2024-0841": {
    id: "ORD-2024-0841",
    date: "2024.05.14",
    brandName: "르블랑",
    brandId: "brand-001",
    status: "SHIPPED",
    trackingNo: "598412873021",
    trackingCompany: "CJ대한통운",
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
    shippingSteps: [
      { status: "주문 접수", time: "2024.05.14 11:22", done: true },
      { status: "결제 완료", time: "2024.05.14 11:23", done: true },
      { status: "주문 확인", time: "2024.05.14 14:05", done: true },
      { status: "출고 완료", time: "2024.05.15 09:30", done: true },
      { status: "배송 중", time: "2024.05.15 13:44", done: true },
      { status: "배송 완료", time: "—", done: false },
    ],
    address: {
      recipient: "김민재",
      phone: "010-1234-5678",
      address: "서울특별시 마포구 합정동 123-4",
      detail: "스타일마켓㈜ 1층",
    },
    paymentMethod: "계좌이체",
    notes: "포장 꼼꼼하게 부탁드립니다.",
    returnDeadline: "2024.05.22",
    canReturn: false,
    reviewed: false,
  },
  "ORD-2024-0802": {
    id: "ORD-2024-0802",
    date: "2024.05.02",
    brandName: "모아뜨",
    brandId: "brand-002",
    status: "DELIVERED",
    trackingNo: "471928374650",
    trackingCompany: "한진택배",
    items: [
      {
        productName: "플로럴 랩 원피스",
        image:
          "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=160&h=160&fit=crop&auto=format",
        sizes: [
          { size: "S", color: "핑크", quantity: 5, unitPrice: 25000 },
          { size: "M", color: "핑크", quantity: 10, unitPrice: 25000 },
          { size: "M", color: "블루", quantity: 8, unitPrice: 25000 },
          { size: "L", color: "블루", quantity: 7, unitPrice: 25000 },
        ],
      },
    ],
    shippingFee: 3000,
    isFreeShipping: false,
    shippingSteps: [
      { status: "주문 접수", time: "2024.05.02 10:10", done: true },
      { status: "결제 완료", time: "2024.05.02 10:11", done: true },
      { status: "주문 확인", time: "2024.05.02 15:30", done: true },
      { status: "출고 완료", time: "2024.05.03 09:00", done: true },
      { status: "배송 중", time: "2024.05.03 14:20", done: true },
      { status: "배송 완료", time: "2024.05.04 11:55", done: true },
    ],
    address: {
      recipient: "김민재",
      phone: "010-1234-5678",
      address: "서울특별시 마포구 합정동 123-4",
      detail: "스타일마켓㈜ 1층",
    },
    paymentMethod: "기업카드",
    returnDeadline: "2024.05.11",
    canReturn: true,
    reviewed: false,
  },
};

export function BuyerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = id ? ordersData[id] : null;
  const [confirmed, setConfirmed] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

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
          to="/buyer/orders"
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

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <Link
        to="/buyer/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5"
      >
        <ChevronLeft size={14} /> 주문 목록으로
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
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/75">
              <span>주문일: {order.date}</span>
              <span>
                브랜드:{" "}
                <span className="text-white font-medium">
                  {order.brandName}
                </span>
              </span>
              {order.trackingNo && (
                <span className="font-mono text-white">
                  {order.trackingCompany} {order.trackingNo}
                </span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">
              ₩{total.toLocaleString()}
            </div>
            <div className="text-xs text-white/70 mt-0.5">
              총 {totalQty.toLocaleString()}장
            </div>
          </div>
        </div>
      </div>

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

          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <Truck size={16} className="text-primary" />
                배송 현황
              </h2>
              {order.trackingNo && (
                <a
                  href={`https://www.cjlogistics.com/ko/tool/parcel/tracking?gnbInvcNo=${order.trackingNo}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary border border-primary/30 hover:bg-primary/5 px-3 py-1.5 rounded transition-colors"
                >
                  택배 조회
                </a>
              )}
            </div>

            <div className="p-5">
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-px bg-muted" />
                <div className="space-y-4">
                  {order.shippingSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-4 relative">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                          step.done ? "bg-primary" : "bg-muted"
                        }`}
                      >
                        {step.done ? (
                          <CheckCircle size={14} className="text-white" />
                        ) : (
                          <Clock size={14} className="text-[#bbb]" />
                        )}
                      </div>
                      <div className="pt-1">
                        <div
                          className={`text-sm font-semibold ${
                            step.done
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {step.status}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {step.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {order.status === "DELIVERED" && !confirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-green-800 mb-0.5">
                  상품을 받으셨나요?
                </p>
                <p className="text-xs text-green-700">
                  구매 확정 시 셀러에게 대금이 지급됩니다.
                </p>
              </div>
              <button
                onClick={() => setConfirmed(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2 rounded transition-colors"
              >
                구매 확정
              </button>
            </div>
          )}

          {confirmed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle size={18} className="text-green-600" />
              <p className="text-sm font-semibold text-green-800">
                구매 확정이 완료되었습니다.
              </p>
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

              {(order.status === "DELIVERED" ||
                order.status === "SHIPPED") && (
                <button className="w-full border border-border text-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <FileText size={14} /> 세금계산서 발행
                </button>
              )}

              {order.status === "DELIVERED" && (
                <button className="w-full border border-border text-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <Download size={14} /> 거래명세서 다운로드
                </button>
              )}

              {order.status === "DELIVERED" && (
                <button className="w-full border border-border text-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <RefreshCw size={14} /> 동일 상품 재주문
                </button>
              )}

              {order.status === "DELIVERED" && !order.reviewed && (
                <button className="w-full border border-amber-300 text-amber-700 hover:bg-amber-50 text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <Star size={14} /> 브랜드 리뷰 작성
                </button>
              )}

              {order.canReturn && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="w-full border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw size={14} /> 반품 / 교환 신청
                </button>
              )}

              {order.status === "PENDING" && (
                <button className="w-full border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2.5 rounded font-medium transition-colors">
                  주문 취소
                </button>
              )}

              <button className="w-full border border-border text-muted-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                <MessageSquare size={14} /> 브랜드 문의
              </button>
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

          {order.status === "DELIVERED" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-700">
              <p className="font-semibold mb-1">반품 · 교환 기한</p>
              <p>
                {order.canReturn
                  ? `${order.returnDeadline}까지 신청 가능합니다.`
                  : "반품·교환 기한이 지났습니다."}
              </p>
              <p className="mt-1 text-amber-600">
                불량 상품에 한해 수령 후 7일 이내 가능
              </p>
            </div>
          )}
        </div>
      </div>

      {showReturnModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="font-bold text-foreground text-base mb-4 flex items-center gap-2">
              <RotateCcw size={16} className="text-red-500" />
              반품 / 교환 신청
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  신청 유형
                </label>
                <div className="flex gap-3">
                  {["반품", "교환"].map((t) => (
                    <label
                      key={t}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="returnType"
                        defaultChecked={t === "반품"}
                        className="accent-primary"
                      />
                      {t}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  사유 선택
                </label>
                <select className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option>불량 / 파손</option>
                  <option>오배송 (다른 상품 수령)</option>
                  <option>사이즈 불일치</option>
                  <option>컬러 불일치</option>
                  <option>기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  증빙 사진 첨부 <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-border rounded-lg p-4 text-center text-xs text-muted-foreground hover:border-primary/40 cursor-pointer transition-colors">
                  클릭하여 사진 첨부 (최대 5장)
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  상세 내용
                </label>
                <textarea
                  rows={3}
                  placeholder="불량 내용이나 요청사항을 자세히 작성해 주세요."
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 border border-border text-foreground hover:border-primary hover:text-primary text-sm py-2.5 rounded font-medium transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => setShowReturnModal(false)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2.5 rounded font-semibold transition-colors"
              >
                신청하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}