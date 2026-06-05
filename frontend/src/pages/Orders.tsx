import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Package, Truck, CheckCircle, Clock, XCircle, ChevronDown, ChevronUp, Search, FileText, Send, AlertCircle, Eye } from "lucide-react";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "PAID" | "CANCELLED";

type QuoteStatus = "REQUESTED" | "SENT" | "NONE";

type ShippingStep = {
  status: string;
  time: string;
  location?: string;
  done: boolean;
};

type Order = {
  id: string;
  date: string;
  supplier: string;
  items: { name: string; quantity: number; unit: string; price: number; currency: string }[];
  status: OrderStatus;
  total: number;
  currency: string;
  trackingNo: string | null;
  quoteStatus: QuoteStatus;
  shippingSteps?: ShippingStep[];
  inspectionCompleted?: boolean;
};

const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING: { label: "결제 대기", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock size={13} /> },
  CONFIRMED: { label: "주문 확인", color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: <CheckCircle size={13} /> },
  PREPARING: { label: "준비 중", color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <Package size={13} /> },
  SHIPPED: { label: "배송 중", color: "text-primary", bg: "bg-secondary border-primary/20", icon: <Truck size={13} /> },
  PAID: { label: "결제 완료", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <CheckCircle size={13} /> },
  CANCELLED: { label: "취소됨", color: "text-red-700", bg: "bg-red-50 border-red-200", icon: <XCircle size={13} /> },
};

const sampleOrders: Order[] = [
  {
    id: "TKR-2024-0841",
    date: "2024.03.18",
    supplier: "코스맥스(주)",
    items: [
      { name: "프리미엄 히알루론산 에센스 50mL", quantity: 1000, unit: "ea", price: 12, currency: "$" },
    ],
    status: "SHIPPED",
    total: 12000,
    currency: "$",
    trackingNo: "TKR-2024-083421",
    quoteStatus: "SENT",
    inspectionCompleted: true,
    shippingSteps: [
      { status: "견적서 수신", time: "2024.03.18 10:22", done: true },
      { status: "결제 완료", time: "2024.03.18 14:30", done: true },
      { status: "출고 준비", time: "2024.03.19 09:15", done: true },
      { status: "배송 시작", time: "2024.03.20 11:40", location: "인천 공항", done: true },
      { status: "창고 검수 완료", time: "2024.06.01 14:30", location: "TradeKR 창고", done: true },
      { status: "국내 배송중", time: "–", done: false },
      { status: "배송 완료", time: "–", done: false },
    ],
  },
  {
    id: "TKR-2024-0820",
    date: "2024.03.10",
    supplier: "메디힐(주)",
    items: [
      { name: "콜라겐 시트 마스크 25mL", quantity: 5000, unit: "ea", price: 2.5, currency: "$" },
      { name: "히알루론산 슬리핑 마스크 100mL", quantity: 2000, unit: "ea", price: 4, currency: "$" },
    ],
    status: "PAID",
    total: 20500,
    currency: "$",
    trackingNo: "TKR-2024-082099",
    quoteStatus: "SENT",
    shippingSteps: [
      { status: "견적서 수신", time: "2024.03.10 11:10", done: true },
      { status: "결제 완료", time: "2024.03.10 15:20", done: true },
      { status: "출고 완료", time: "2024.03.11 10:00", done: true },
      { status: "배송 시작", time: "2024.03.12 08:30", done: true },
      { status: "통관 완료", time: "2024.03.14 14:20", done: true },
      { status: "국내 배송 완료", time: "2024.03.15 16:40", location: "서울 강남구", done: true },
    ],
  },
  {
    id: "TKR-2024-0807",
    date: "2024.02.28",
    supplier: "에스트라(주)",
    items: [
      { name: "쿠션 파운데이션 SPF50+ (15g)", quantity: 500, unit: "ea", price: 15, currency: "$" },
    ],
    status: "CONFIRMED",
    total: 7500,
    currency: "$",
    trackingNo: null,
    quoteStatus: "SENT",
  },
  {
    id: "TKR-2024-0791",
    date: "2024.02.20",
    supplier: "토니모리(주)",
    items: [
      { name: "클렌징폼 민감성 피부용 150mL", quantity: 1000, unit: "ea", price: 5, currency: "$" },
    ],
    status: "CANCELLED",
    total: 5000,
    currency: "$",
    trackingNo: null,
    quoteStatus: "NONE",
  },
  {
    id: "TKR-2024-0788",
    date: "2024.02.15",
    supplier: "한국콜마(주)",
    items: [
      { name: "비타민C 브라이트닝 세럼 30mL", quantity: 2000, unit: "ea", price: 9, currency: "$" },
    ],
    status: "PENDING",
    total: 18000,
    currency: "$",
    trackingNo: null,
    quoteStatus: "REQUESTED",
  },
];

const statusFilters: { value: string; label: string }[] = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "결제 대기" },
  { value: "CONFIRMED", label: "주문 확인" },
  { value: "PREPARING", label: "준비 중" },
  { value: "SHIPPED", label: "배송 중" },
  { value: "PAID", label: "완료" },
  { value: "CANCELLED", label: "취소" },
];

export function Orders() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const filtered = sampleOrders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch = o.id.includes(search) || o.supplier.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.includes(search));
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Package size={24} className="text-primary" /> 주문 관리
      </h1>

      {/* Filters */}
      <div className="bg-white border border-border rounded p-4 mb-5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center border border-border rounded px-3 py-2 gap-2 flex-1 min-w-[220px]">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="주문번호, 공급업체, 제품명 검색..."
            className="text-sm outline-none flex-1"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                statusFilter === f.value
                  ? "bg-primary text-white border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Order List */}
      <div className="space-y-3">
        {filtered.map((order) => {
          const status = statusConfig[order.status];
          const isExpanded = expandedId === order.id;

          const quoteStatusDisplay = {
            REQUESTED: { label: "견적 요청됨", color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: <Clock size={11} /> },
            SENT: { label: "견적서 수신", color: "text-green-700", bg: "bg-green-50 border-green-200", icon: <Send size={11} /> },
            NONE: { label: "견적 미요청", color: "text-muted-foreground", bg: "bg-muted border-border", icon: <AlertCircle size={11} /> },
          };
          const quoteDisplay = quoteStatusDisplay[order.quoteStatus];

          return (
            <div key={order.id} className="bg-white border border-border rounded overflow-hidden">
              {/* Order Header */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono font-bold text-sm text-foreground">{order.id}</span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${status.bg} ${status.color}`}>
                      {status.icon}
                      {status.label}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${quoteDisplay.bg} ${quoteDisplay.color}`}>
                      {quoteDisplay.icon}
                      {quoteDisplay.label}
                    </span>
                    {order.status === "SHIPPED" && order.trackingNo && (
                      <span className="text-[11px] text-primary font-mono bg-secondary px-2 py-0.5 rounded border border-primary/20">
                        {order.trackingNo}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-4">
                    <span>{order.date}</span>
                    <span>{order.supplier}</span>
                    <span>{order.items.length}개 품목</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-bold text-foreground font-mono">{order.currency}{order.total.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{order.items.reduce((a, i) => a + i.quantity, 0).toLocaleString()}개</div>
                </div>
                {isExpanded ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-border bg-muted/20 px-5 py-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="text-foreground">{item.name}</div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-muted-foreground font-mono">{item.quantity.toLocaleString()} {item.unit} × {item.currency}{item.price}</span>
                          <span className="ml-3 font-bold font-mono text-foreground">{item.currency}{(item.quantity * item.price).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.shippingSteps && order.shippingSteps.length > 0 && (
                    <div className="border-t border-border pt-4 mb-4">
                      <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <Truck size={13} className="text-primary" /> 배송 현황
                      </h4>
                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-muted" />
                        <div className="space-y-2.5">
                          {order.shippingSteps.map((step, i) => (
                            <div key={i} className="flex items-start gap-3 relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.done ? "bg-primary" : "bg-muted"}`}>
                                {step.done
                                  ? <CheckCircle size={14} className="text-white" />
                                  : <Clock size={14} className="text-[#bbb]" />
                                }
                              </div>
                              <div className="pt-0.5 flex-1">
                                <div className={`text-xs font-semibold ${step.done ? "text-foreground" : "text-[#bbb]"}`}>{step.status}</div>
                                <div className="text-[11px] text-muted-foreground font-mono">{step.time}</div>
                                {step.location && <div className="text-[11px] text-primary">{step.location}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-3 border-t border-border">
                    {order.quoteStatus === "REQUESTED" && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded border border-amber-200">
                        <FileText size={12} />
                        견적서 대기 중
                      </div>
                    )}
                    {order.quoteStatus === "SENT" && (
                      <button className="border border-green-300 text-green-700 hover:bg-green-50 text-xs px-4 py-2 rounded font-medium transition-colors flex items-center gap-1.5">
                        <FileText size={12} />
                        견적서 확인
                      </button>
                    )}
                    {order.inspectionCompleted && (
                      <button
                        onClick={() => navigate(`/inspection?orderId=${order.id}`)}
                        className="border border-primary text-primary hover:bg-primary hover:text-white text-xs px-4 py-2 rounded font-medium transition-colors flex items-center gap-1.5"
                      >
                        <Eye size={12} />
                        검수 결과 보기
                      </button>
                    )}
                    {order.status === "SHIPPED" && order.trackingNo && (
                      <button className="border border-primary text-primary hover:bg-primary hover:text-white text-xs px-4 py-2 rounded font-medium transition-colors">
                        배송 추적
                      </button>
                    )}
                    {(order.status === "PENDING") && (
                      <button className="border border-red-300 text-red-600 hover:bg-red-50 text-xs px-4 py-2 rounded font-medium transition-colors">
                        주문 취소
                      </button>
                    )}
                    {order.status === "PAID" && (
                      <button className="border border-border text-muted-foreground hover:border-primary hover:text-primary text-xs px-4 py-2 rounded font-medium transition-colors">
                        인보이스 다운로드
                      </button>
                    )}
                    <Link to={`/orders/${order.id}`} className="text-xs text-muted-foreground hover:text-primary transition-colors ml-auto flex items-center gap-1">
                      <Eye size={11} /> 주문 상세 보기
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <Package size={40} className="mx-auto mb-3 opacity-30" />
          <div className="font-medium">주문 내역이 없습니다</div>
          <div className="text-sm mt-1">다른 필터를 선택하거나 새로운 주문을 시작해보세요</div>
        </div>
      )}
    </div>
  );
}
