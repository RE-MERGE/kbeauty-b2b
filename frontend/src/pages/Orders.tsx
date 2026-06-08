import { useState } from "react";
import { Link } from "react-router";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  Send,
  AlertCircle,
  Eye,
  X,
} from "lucide-react";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "PAID"
  | "CANCELLED";

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
  items: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
    currency: string;
  }[];
  status: OrderStatus;
  total: number;
  currency: string;
  trackingNo: string | null;
  quoteStatus: QuoteStatus;
  shippingSteps?: ShippingStep[];
  inspectionCompleted?: boolean;
  cancelReason?: string;
  cancelledAt?: string;
};

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ReactNode }
> = {
  PENDING: {
    label: "결제 대기",
    color: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    icon: <Clock size={13} />,
  },
  CONFIRMED: {
    label: "주문 확인",
    color: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    icon: <CheckCircle size={13} />,
  },
  PREPARING: {
    label: "준비 중",
    color: "text-purple-700",
    bg: "bg-purple-50 border-purple-200",
    icon: <Package size={13} />,
  },
  SHIPPED: {
    label: "배송 중",
    color: "text-primary",
    bg: "bg-secondary border-primary/20",
    icon: <Truck size={13} />,
  },
  PAID: {
    label: "배송 완료",
    color: "text-green-700",
    bg: "bg-green-50 border-green-200",
    icon: <CheckCircle size={13} />,
  },
  CANCELLED: {
    label: "취소됨",
    color: "text-red-700",
    bg: "bg-red-50 border-red-200",
    icon: <XCircle size={13} />,
  },
};

const sampleOrders: Order[] = [
  {
    id: "ORD-2024-0841",
    date: "2024.03.18",
    supplier: "르블랑",
    items: [
      {
        name: "여성 린넨 오버핏 블라우스",
        quantity: 70,
        unit: "장",
        price: 12000,
        currency: "₩",
      },
      {
        name: "와이드 린넨 슬랙스",
        quantity: 25,
        unit: "장",
        price: 18000,
        currency: "₩",
      },
    ],
    status: "SHIPPED",
    total: 1290000,
    currency: "₩",
    trackingNo: "598412873021",
    quoteStatus: "SENT",
    inspectionCompleted: true,
    shippingSteps: [
      { status: "견적서 수신", time: "2024.03.18 10:22", done: true },
      { status: "결제 완료", time: "2024.03.18 14:30", done: true },
      { status: "출고 준비", time: "2024.03.19 09:15", done: true },
      {
        status: "배송 시작",
        time: "2024.03.20 11:40",
        location: "CJ대한통운",
        done: true,
      },
      {
        status: "검수 완료",
        time: "2024.03.21 14:30",
        location: "바이어 검수",
        done: true,
      },
      { status: "거래 확정 대기", time: "–", done: false },
    ],
  },
  {
    id: "ORD-2024-0820",
    date: "2024.03.10",
    supplier: "모아뜨",
    items: [
      {
        name: "플로럴 랩 원피스",
        quantity: 30,
        unit: "장",
        price: 25000,
        currency: "₩",
      },
    ],
    status: "PAID",
    total: 753000,
    currency: "₩",
    trackingNo: "471928374650",
    quoteStatus: "SENT",
    inspectionCompleted: true,
    shippingSteps: [
      { status: "견적서 수신", time: "2024.03.10 11:10", done: true },
      { status: "결제 완료", time: "2024.03.10 15:20", done: true },
      { status: "출고 완료", time: "2024.03.11 10:00", done: true },
      { status: "배송 시작", time: "2024.03.12 08:30", done: true },
      { status: "배송 완료", time: "2024.03.14 14:20", done: true },
    ],
  },
  {
    id: "ORD-2024-0807",
    date: "2024.02.28",
    supplier: "데일리앤코",
    items: [
      {
        name: "여성 봄 니트 가디건",
        quantity: 40,
        unit: "장",
        price: 16200,
        currency: "₩",
      },
    ],
    status: "CONFIRMED",
    total: 648000,
    currency: "₩",
    trackingNo: null,
    quoteStatus: "SENT",
  },
  {
    id: "ORD-2024-0791",
    date: "2024.02.20",
    supplier: "어반드레스",
    items: [
      {
        name: "플리츠 미디 스커트",
        quantity: 45,
        unit: "장",
        price: 15000,
        currency: "₩",
      },
    ],
    status: "CANCELLED",
    total: 675000,
    currency: "₩",
    trackingNo: null,
    quoteStatus: "SENT",
    cancelReason: "내부 예산 변경으로 인해 주문을 진행하지 않기로 결정했습니다.",
    cancelledAt: "2024.02.21 13:20",
  },
  {
    id: "ORD-2024-0788",
    date: "2024.02.15",
    supplier: "라온어패럴",
    items: [
      {
        name: "여성 베이직 오버핏 셔츠",
        quantity: 50,
        unit: "장",
        price: 18900,
        currency: "₩",
      },
    ],
    status: "PENDING",
    total: 945000,
    currency: "₩",
    trackingNo: null,
    quoteStatus: "REQUESTED",
  },
];

const statusFilters = [
  { value: "ALL", label: "전체" },
  { value: "PENDING", label: "결제 대기" },
  { value: "CONFIRMED", label: "주문 확인" },
  { value: "PREPARING", label: "준비 중" },
  { value: "SHIPPED", label: "배송 중" },
  { value: "PAID", label: "배송 완료" },
  { value: "CANCELLED", label: "취소" },
];

export function Orders() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [confirmTarget, setConfirmTarget] = useState<Order | null>(null);
  const [disputeTarget, setDisputeTarget] = useState<Order | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Order | null>(null);

  const filtered = sampleOrders.filter((o) => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch =
      o.id.includes(search) ||
      o.supplier.toLowerCase().includes(search.toLowerCase()) ||
      o.items.some((i) => i.name.includes(search));

    return matchStatus && matchSearch;
  });

  const handleConfirmTrade = () => {
    setConfirmTarget(null);
    alert("거래가 확정되었습니다. 공급사 정산 절차가 진행됩니다.");
  };

  const handleSubmitDispute = () => {
    setDisputeTarget(null);
    alert("이의 제기가 접수되었습니다. 관리자가 검토 후 안내드립니다.");
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Package size={24} className="text-primary" />
        주문 관리
      </h1>

      <div className="bg-white border border-border rounded p-4 mb-5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center border border-border rounded px-3 py-2 gap-2 flex-1 min-w-[220px]">
          <Search size={14} className="text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="주문번호, 공급사, 상품명 검색..."
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

      <div className="space-y-3">
        {filtered.map((order) => {
          const status = statusConfig[order.status];
          const isExpanded = expandedId === order.id;

          const quoteStatusDisplay = {
            REQUESTED: {
              label: "견적 요청됨",
              color: "text-amber-700",
              bg: "bg-amber-50 border-amber-200",
              icon: <Clock size={11} />,
            },
            SENT: {
              label: "견적서 수신",
              color: "text-green-700",
              bg: "bg-green-50 border-green-200",
              icon: <Send size={11} />,
            },
            NONE: {
              label: "견적 미요청",
              color: "text-muted-foreground",
              bg: "bg-muted border-border",
              icon: <AlertCircle size={11} />,
            },
          };

          const quoteDisplay = quoteStatusDisplay[order.quoteStatus];

          return (
            <div
              key={order.id}
              className="bg-white border border-border rounded overflow-hidden"
            >
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="font-mono font-bold text-sm text-foreground">
                      {order.id}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${status.bg} ${status.color}`}
                    >
                      {status.icon}
                      {status.label}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${quoteDisplay.bg} ${quoteDisplay.color}`}
                    >
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
                  <div className="font-bold text-foreground font-mono">
                    {order.currency}
                    {order.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {order.items
                      .reduce((a, i) => a + i.quantity, 0)
                      .toLocaleString()}
                    장
                  </div>
                </div>

                {isExpanded ? (
                  <ChevronUp
                    size={16}
                    className="text-muted-foreground flex-shrink-0"
                  />
                ) : (
                  <ChevronDown
                    size={16}
                    className="text-muted-foreground flex-shrink-0"
                  />
                )}
              </div>

              {isExpanded && (
                <div className="border-t border-border bg-muted/20 px-5 py-4">
                  <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="text-foreground">{item.name}</div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <span className="text-muted-foreground font-mono">
                            {item.quantity.toLocaleString()} {item.unit} ×{" "}
                            {item.currency}
                            {item.price.toLocaleString()}
                          </span>
                          <span className="ml-3 font-bold font-mono text-foreground">
                            {item.currency}
                            {(item.quantity * item.price).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.shippingSteps && order.shippingSteps.length > 0 && (
                    <div className="border-t border-border pt-4 mb-4">
                      <h4 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                        <Truck size={13} className="text-primary" />
                        배송 및 검수 현황
                      </h4>

                      <div className="relative">
                        <div className="absolute left-[15px] top-0 bottom-0 w-px bg-muted" />
                        <div className="space-y-2.5">
                          {order.shippingSteps.map((step, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 relative"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                                  step.done ? "bg-primary" : "bg-muted"
                                }`}
                              >
                                {step.done ? (
                                  <CheckCircle
                                    size={14}
                                    className="text-white"
                                  />
                                ) : (
                                  <Clock size={14} className="text-[#bbb]" />
                                )}
                              </div>

                              <div className="pt-0.5 flex-1">
                                <div
                                  className={`text-xs font-semibold ${
                                    step.done
                                      ? "text-foreground"
                                      : "text-[#bbb]"
                                  }`}
                                >
                                  {step.status}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono">
                                  {step.time}
                                </div>
                                {step.location && (
                                  <div className="text-[11px] text-primary">
                                    {step.location}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-3 border-t border-border flex-wrap">
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

                    {order.status === "PENDING" && (
                      <button className="border border-red-300 text-red-600 hover:bg-red-50 text-xs px-4 py-2 rounded font-medium transition-colors">
                        주문 취소
                      </button>
                    )}

                    {order.status === "PAID" && (
                      <>
                        <button
                          onClick={() => setConfirmTarget(order)}
                          className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors"
                        >
                          거래 확정
                        </button>

                        <button
                          onClick={() => setDisputeTarget(order)}
                          className="border border-red-300 text-red-600 hover:bg-red-50 text-xs px-4 py-2 rounded font-medium transition-colors"
                        >
                          이의 제기
                        </button>
                      </>
                    )}

                    {order.status === "CANCELLED" && (
                      <button
                        onClick={() => setCancelTarget(order)}
                        className="border border-red-300 text-red-600 hover:bg-red-50 text-xs px-4 py-2 rounded font-medium transition-colors"
                      >
                        취소 사유 보기
                      </button>
                    )}

                    <Link
                      to={`/buyer/orders/${order.id}`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors ml-auto flex items-center gap-1"
                    >
                      <Eye size={11} />
                      주문 상세 보기
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
          <div className="text-sm mt-1">
            다른 필터를 선택하거나 새로운 주문을 시작해보세요
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setConfirmTarget(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle size={26} className="text-green-600" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">
              거래를 확정하시겠습니까?
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              상품 수량 및 오염·하자가 없는지 검수를 완료하셨나요?
              <br />
              거래 확정 이후에는 이의 제기가 어려우며, 대금이 공급사에게
              정산됩니다.
            </p>

            <div className="bg-secondary/60 border border-border rounded p-3 text-xs text-muted-foreground mb-5">
              <div className="font-semibold text-foreground mb-1">
                주문번호 {confirmTarget.id}
              </div>
              <div>
                공급사 {confirmTarget.supplier} · 결제금액{" "}
                {confirmTarget.currency}
                {confirmTarget.total.toLocaleString()}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 border border-border text-foreground hover:border-primary hover:text-primary py-2.5 rounded text-sm font-medium transition-colors"
              >
                취소
              </button>

              <button
                onClick={handleConfirmTrade}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-2.5 rounded text-sm font-semibold transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {disputeTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setDisputeTarget(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <AlertCircle size={26} className="text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">
              이의 제기 접수
            </h3>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              상품 수량 부족, 오염, 하자, 오배송 등 문제가 있는 경우 이의 제기를
              접수할 수 있습니다. 접수 후 관리자가 거래 이력을 확인하고 검토합니다.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  이의 유형
                </label>
                <select className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white">
                  <option>수량 부족</option>
                  <option>오염 / 하자</option>
                  <option>오배송</option>
                  <option>파손</option>
                  <option>기타</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  증빙 사진 첨부
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
                  placeholder="상품 문제 상황을 자세히 작성해 주세요."
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setDisputeTarget(null)}
                className="flex-1 border border-border text-foreground hover:border-primary hover:text-primary py-2.5 rounded text-sm font-medium transition-colors"
              >
                취소
              </button>

              <button
                onClick={handleSubmitDispute}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded text-sm font-semibold transition-colors"
              >
                접수하기
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setCancelTarget(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mb-4">
              <XCircle size={26} className="text-red-600" />
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2">
              주문 취소 정보
            </h3>

            <div className="bg-secondary/60 border border-border rounded p-3 text-xs text-muted-foreground mb-4">
              <div className="font-semibold text-foreground mb-1">
                주문번호 {cancelTarget.id}
              </div>
              <div>
                공급사 {cancelTarget.supplier} · 주문금액{" "}
                {cancelTarget.currency}
                {cancelTarget.total.toLocaleString()}
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-sm font-semibold text-red-800">취소일시</div>
              <div className="text-sm text-red-700 mt-1">
                {cancelTarget.cancelledAt ?? "취소일시 정보 없음"}
              </div>
            </div>

            <div className="mb-5">
              <div className="text-sm font-semibold text-foreground mb-2">
                취소 사유
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {cancelTarget.cancelReason ?? "취소 사유가 등록되지 않았습니다."}
              </div>
            </div>

            <button
              onClick={() => setCancelTarget(null)}
              className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded text-sm font-semibold transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}