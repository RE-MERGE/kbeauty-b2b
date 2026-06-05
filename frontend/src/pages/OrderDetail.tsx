import { useParams, Link } from "react-router";
import {
  Package, Truck, CheckCircle, Clock, XCircle, ChevronLeft, FileText,
  Send, Download, Eye, MapPin, Phone, Mail, AlertCircle,
} from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "PAID" | "CANCELLED";

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: "결제 대기", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock size={14} /> },
  CONFIRMED: { label: "주문 확인", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <CheckCircle size={14} /> },
  PREPARING: { label: "준비 중", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <Package size={14} /> },
  SHIPPED: { label: "배송 중", color: "text-primary", bg: "bg-secondary border-primary/20", icon: <Truck size={14} /> },
  PAID: { label: "결제 완료", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle size={14} /> },
  CANCELLED: { label: "취소됨", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle size={14} /> },
};

const ordersData: Record<string, {
  id: string; date: string; supplier: string; supplierContact: string; supplierEmail: string;
  status: OrderStatus; total: number; currency: string; trackingNo: string | null;
  quoteStatus: "REQUESTED" | "SENT" | "NONE";
  quote?: { id: string; unitPrice: string; validUntil: string; notes: string };
  items: { name: string; quantity: number; unit: string; price: number; currency: string; sku: string }[];
  shipping: { method: string; from: string; to: string; estimatedDays: string; cost: number };
  shippingSteps?: { status: string; time: string; location?: string; done: boolean }[];
  inspectionCompleted?: boolean;
  address: { recipient: string; phone: string; address: string; detail: string };
  paymentMethod: string;
  notes?: string;
}> = {
  "TKR-2024-0841": {
    id: "TKR-2024-0841",
    date: "2024.03.18",
    supplier: "코스맥스(주)",
    supplierContact: "김영호",
    supplierEmail: "export@cosmax.co.kr",
    status: "SHIPPED",
    total: 12000,
    currency: "$",
    trackingNo: "TKR-2024-083421",
    quoteStatus: "SENT",
    quote: {
      id: "QUO-2024-0033",
      unitPrice: "$12.00",
      validUntil: "2024.04.01",
      notes: "CGMP 인증 공장 생산, FDA OTC 등록 완료",
    },
    items: [
      { name: "프리미엄 히알루론산 에센스 50mL", quantity: 1000, unit: "ea", price: 12, currency: "$", sku: "CX-HYA-50ML-001" },
    ],
    shipping: { method: "해운 (FCL)", from: "인천항", to: "LA항", estimatedDays: "18~22일", cost: 1200 },
    shippingSteps: [
      { status: "견적서 수신", time: "2024.03.18 10:22", done: true },
      { status: "결제 완료", time: "2024.03.18 14:30", done: true },
      { status: "출고 준비", time: "2024.03.19 09:15", done: true },
      { status: "배송 시작", time: "2024.03.20 11:40", location: "인천 공항", done: true },
      { status: "창고 검수 완료", time: "2024.06.01 14:30", location: "TradeKR 창고", done: true },
      { status: "국내 배송중", time: "—", done: false },
      { status: "배송 완료", time: "—", done: false },
    ],
    inspectionCompleted: true,
    address: { recipient: "홍길동", phone: "010-1234-5678", address: "서울특별시 강남구 테헤란로 123", detail: "A동 5층 글로벌뷰티㈜" },
    paymentMethod: "에스크로",
    notes: "유리병 포장 필수, 개별 박스 포함 요청",
  },
  "TKR-2024-0820": {
    id: "TKR-2024-0820",
    date: "2024.03.10",
    supplier: "메디힐(주)",
    supplierContact: "이수진",
    supplierEmail: "global@mediheal.com",
    status: "PAID",
    total: 20500,
    currency: "$",
    trackingNo: "TKR-2024-082099",
    quoteStatus: "SENT",
    quote: {
      id: "QUO-2024-0028",
      unitPrice: "$2.50 / $4.00",
      validUntil: "2024.03.25",
      notes: "개별 알루미늄 파우치 포장 포함",
    },
    items: [
      { name: "콜라겐 시트 마스크 25mL", quantity: 5000, unit: "ea", price: 2.5, currency: "$", sku: "MH-CM-25ML-001" },
      { name: "히알루론산 슬리핑 마스크 100mL", quantity: 2000, unit: "ea", price: 4, currency: "$", sku: "MH-SL-100ML-002" },
    ],
    shipping: { method: "항공", from: "인천공항", to: "나리타공항", estimatedDays: "3~5일", cost: 800 },
    shippingSteps: [
      { status: "견적서 수신", time: "2024.03.10 11:10", done: true },
      { status: "결제 완료", time: "2024.03.10 15:20", done: true },
      { status: "출고 완료", time: "2024.03.11 10:00", done: true },
      { status: "배송 시작", time: "2024.03.12 08:30", done: true },
      { status: "통관 완료", time: "2024.03.14 14:20", done: true },
      { status: "국내 배송 완료", time: "2024.03.15 16:40", location: "서울 강남구", done: true },
    ],
    address: { recipient: "홍길동", phone: "010-1234-5678", address: "서울특별시 강남구 테헤란로 123", detail: "A동 5층 글로벌뷰티㈜" },
    paymentMethod: "에스크로",
  },
  "TKR-2024-0807": {
    id: "TKR-2024-0807",
    date: "2024.02.28",
    supplier: "에스트라(주)",
    supplierContact: "박민준",
    supplierEmail: "trade@aestura.com",
    status: "CONFIRMED",
    total: 7500,
    currency: "$",
    trackingNo: null,
    quoteStatus: "SENT",
    quote: {
      id: "QUO-2024-0021",
      unitPrice: "$15.00",
      validUntil: "2024.03.15",
      notes: "SPF50+ PA++++ 성능 테스트 보고서 동봉",
    },
    items: [
      { name: "쿠션 파운데이션 SPF50+ (15g)", quantity: 500, unit: "ea", price: 15, currency: "$", sku: "AES-CF-15G-001" },
    ],
    shipping: { method: "해운 (LCL)", from: "부산항", to: "시드니항", estimatedDays: "25~30일", cost: 650 },
    address: { recipient: "홍길동", phone: "010-1234-5678", address: "서울특별시 강남구 테헤란로 123", detail: "A동 5층 글로벌뷰티㈜" },
    paymentMethod: "에스크로",
  },
};

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const order = id ? ordersData[id] : null;

  if (!order) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-center">
        <Package size={48} className="mx-auto mb-4 opacity-30 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground mb-2">주문을 찾을 수 없습니다</h2>
        <p className="text-muted-foreground mb-5">주문번호를 확인해 주세요.</p>
        <Link to="/orders" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors">
          주문 목록으로
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.status];
  const subtotal = order.items.reduce((a, i) => a + i.quantity * i.price, 0);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* Back */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5">
        <ChevronLeft size={14} /> 주문 목록으로
      </Link>

      {/* Header */}
      <div className="bg-white border border-border rounded-lg p-6 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-foreground font-mono">{order.id}</h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${status.bg} ${status.color}`}>
                {status.icon}{status.label}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>주문일: {order.date}</span>
              <span>공급업체: {order.supplier}</span>
              {order.trackingNo && (
                <span className="font-mono text-primary">트래킹: {order.trackingNo}</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-foreground font-mono">{order.currency}{order.total.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground mt-0.5">총 {order.items.reduce((a, i) => a + i.quantity, 0).toLocaleString()}개</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-5">
        {/* Left */}
        <div className="space-y-5">
          {/* Items */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-bold text-foreground flex items-center gap-2"><Package size={16} className="text-primary" />주문 상품</h2>
            </div>
            <div className="divide-y divide-border">
              {order.items.map((item) => (
                <div key={item.sku} className="px-5 py-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground mb-1">{item.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground font-mono">{item.currency}{(item.quantity * item.price).toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{item.quantity.toLocaleString()}{item.unit} × {item.currency}{item.price}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-muted/30 px-5 py-4 border-t border-border">
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">제품 소계</span>
                <span className="font-mono">{order.currency}{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">운임 ({order.shipping.method})</span>
                <span className="font-mono">{order.currency}{order.shipping.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-muted-foreground">관세 (FTA 적용)</span>
                <span className="font-mono text-green-600">$0</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                <span className="text-foreground">합계</span>
                <span className="font-mono text-foreground">{order.currency}{order.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Shipping Timeline */}
          {order.shippingSteps && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2"><Truck size={16} className="text-primary" />배송 현황</h2>
              </div>
              <div className="p-5">
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-px bg-muted" />
                  <div className="space-y-4">
                    {order.shippingSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-4 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.done ? "bg-primary" : "bg-muted"}`}>
                          {step.done ? <CheckCircle size={14} className="text-white" /> : <Clock size={14} className="text-[#bbb]" />}
                        </div>
                        <div className="pt-0.5">
                          <div className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}>{step.status}</div>
                          <div className="text-xs text-muted-foreground font-mono">{step.time}</div>
                          {step.location && <div className="text-xs text-primary">{step.location}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quote */}
          {order.quoteStatus === "SENT" && order.quote && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2"><FileText size={16} className="text-primary" />견적서</h2>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-mono text-sm font-bold text-foreground">{order.quote.id}</span>
                  <span className="bg-green-50 text-green-700 border border-green-200 text-[11px] px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <Send size={10} /> 수신 완료
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{order.quote.unitPrice}</div></div>
                  <div><div className="text-xs text-muted-foreground">유효기한</div><div className="font-medium text-foreground">{order.quote.validUntil}</div></div>
                  <div><div className="text-xs text-muted-foreground">공급업체</div><div className="font-medium text-foreground">{order.supplier}</div></div>
                </div>
                <div className="bg-muted/30 border border-border rounded p-3 text-sm text-foreground mb-3">{order.quote.notes}</div>
                <button className="border border-border text-muted-foreground hover:border-primary hover:text-primary text-xs px-4 py-2 rounded transition-colors flex items-center gap-1.5">
                  <Download size={12} /> 견적서 PDF 다운로드
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-4 text-sm">주문 액션</h3>
            <div className="space-y-2">
              {order.inspectionCompleted && (
                <Link to={`/inspection?orderId=${order.id}`} className="w-full border border-primary text-primary hover:bg-primary hover:text-white text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <Eye size={14} /> 검수 결과 보기
                </Link>
              )}
              {order.status === "SHIPPED" && order.trackingNo && (
                <button className="w-full border border-primary text-primary hover:bg-primary hover:text-white text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <Truck size={14} /> 배송 추적
                </button>
              )}
              {order.status === "PAID" && (
                <button className="w-full border border-border text-muted-foreground hover:border-primary hover:text-primary text-sm px-4 py-2.5 rounded font-medium transition-colors flex items-center justify-center gap-2">
                  <Download size={14} /> 인보이스 다운로드
                </button>
              )}
              {order.status === "PENDING" && (
                <button className="w-full border border-red-300 text-red-600 hover:bg-red-50 text-sm px-4 py-2.5 rounded font-medium transition-colors">
                  주문 취소
                </button>
              )}
            </div>
          </div>

          {/* Supplier Info */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-4 text-sm">공급업체 정보</h3>
            <div className="space-y-2.5 text-sm">
              <div className="font-semibold text-foreground">{order.supplier}</div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={13} /> {order.supplierContact}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={13} /> {order.supplierEmail}
              </div>
            </div>
          </div>

          {/* Shipping Info */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-4 text-sm">배송 정보</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">배송 방법</span>
                <span className="font-medium text-foreground">{order.shipping.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">출발지</span>
                <span className="font-medium text-foreground">{order.shipping.from}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">목적지</span>
                <span className="font-medium text-foreground">{order.shipping.to}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">예상 기간</span>
                <span className="font-medium text-foreground">{order.shipping.estimatedDays}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-4 text-sm flex items-center gap-2">
              <MapPin size={14} className="text-primary" /> 수령지
            </h3>
            <div className="text-sm space-y-1">
              <div className="font-semibold text-foreground">{order.address.recipient}</div>
              <div className="text-muted-foreground">{order.address.phone}</div>
              <div className="text-muted-foreground">{order.address.address}</div>
              <div className="text-muted-foreground text-xs">{order.address.detail}</div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white border border-border rounded-lg p-5">
            <h3 className="font-bold text-foreground mb-3 text-sm">결제 정보</h3>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">결제 방법</span>
              <span className="font-medium text-foreground">{order.paymentMethod}</span>
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
