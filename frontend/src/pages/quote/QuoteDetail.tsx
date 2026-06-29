import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ChevronLeft, FileText, CheckCircle, Package, Truck, Calendar,
  AlertCircle, Clock, FlaskConical, ShieldCheck, Building2, Star,
  Download, MessageCircle, XCircle, ChevronDown, ChevronUp, Info,
  PenLine, RotateCcw,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────────────────────
type QuoteStatus = "REVIEWING" | "APPROVED" | "REJECTED" | "NEGOTIATING" | "EXPIRED";

type SizeRow   = { size: string; quantity: number; unitPrice: number };
type ColorRow  = { color: string; sizes: SizeRow[] };

type Quote = {
  id: string;
  requestId: string;
  submittedAt: string;
  validUntil: string;
  status: QuoteStatus;
  // 공급사
  seller: {
    name: string; storeName: string; location: string;
    rating: number; totalOrders: number; reorderRate: number;
    badges: string[]; established: number;
  };
  // 상품
  brandName: string; productName: string; category: string;
  material: string; origin: string; leadTime: string;
  // SKU
  colors: ColorRow[];
  // 배송
  shippingCompany: string; shippingFee: number; freeShippingThreshold: number;
  // 조건
  sampleAvailable: boolean; samplePrice: number;
  returnPolicy: string; notes: string;
};

// ── 더미 데이터 ────────────────────────────────────────────────────────
const QUOTES: Record<string, Quote> = {
  "BID-005": {
    id: "BID-005", requestId: "SRC-2024-0142",
    submittedAt: "2024.05.24 14:32", validUntil: "2024.05.31",
    status: "REVIEWING",
    seller: {
      name: "르블랑", storeName: "르블랑 어패럴",
      location: "서울 동대문", rating: 4.8, totalOrders: 312,
      reorderRate: 74, established: 2016,
      badges: ["검증업체", "자체공장", "빠른출고"],
    },
    brandName: "르블랑", productName: "여성 린넨 오버핏 블라우스",
    category: "상의", material: "린넨 100%", origin: "국내산",
    leadTime: "3~5일",
    colors: [
      {
        color: "화이트",
        sizes: [
          { size: "S",  quantity: 20, unitPrice: 12000 },
          { size: "M",  quantity: 60, unitPrice: 12000 },
          { size: "L",  quantity: 40, unitPrice: 12000 },
          { size: "XL", quantity: 20, unitPrice: 12000 },
        ],
      },
      {
        color: "베이지",
        sizes: [
          { size: "S",  quantity: 15, unitPrice: 12000 },
          { size: "M",  quantity: 45, unitPrice: 12000 },
          { size: "L",  quantity: 30, unitPrice: 12000 },
          { size: "XL", quantity: 10, unitPrice: 12000 },
        ],
      },
    ],
    shippingCompany: "CJ대한통운", shippingFee: 3000, freeShippingThreshold: 500000,
    sampleAvailable: true, samplePrice: 18000,
    returnPolicy: "수령 후 7일 이내 불량 건에 한해 교환 가능, 단순 변심 반품 불가",
    notes: "재고 한정 수량이므로 빠른 채택 부탁드립니다. 200장 이상 추가 주문 시 단가 협의 가능합니다.",
  },
};

const statusConfig: Record<QuoteStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  REVIEWING:   { label: "검토 중",    color: "text-blue-700",   bg: "bg-blue-50 border-blue-200",     icon: <Clock size={13} />       },
  APPROVED:    { label: "채택 완료",  color: "text-green-700",  bg: "bg-green-50 border-green-200",   icon: <CheckCircle size={13} /> },
  REJECTED:    { label: "거절됨",     color: "text-red-700",    bg: "bg-red-50 border-red-200",       icon: <XCircle size={13} />     },
  NEGOTIATING: { label: "협의 중",    color: "text-purple-700", bg: "bg-purple-50 border-purple-200", icon: <MessageCircle size={13}/> },
  EXPIRED:     { label: "기간 만료",  color: "text-muted-foreground", bg: "bg-muted border-border",   icon: <RotateCcw size={13} />   },
};

// ── 소수 별점 ──────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map((s) => (
        <Star key={s} size={12} className={s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating}</span>
    </div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────
export function QuoteDetail() {
  const { bidId } = useParams<{ bidId: string }>();
  const quote = bidId ? QUOTES[bidId] : QUOTES["BID-005"];

  const [expandedColor, setExpandedColor] = useState<string | null>(quote?.colors[0]?.color ?? null);
  const [action, setAction] = useState<"approve" | "reject" | "negotiate" | null>(null);
  const [negotiateText, setNegotiateText] = useState("");
  const [done, setDone] = useState<"approved" | "rejected" | "negotiated" | null>(null);

  if (!quote) {
    return (
      <div className="max-w-[900px] mx-auto px-4 py-16 text-center">
        <Package size={48} className="mx-auto mb-4 opacity-30 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-4">견적서를 찾을 수 없습니다</h2>
        <Link to="/buyer/my-sourcing" className="bg-[#C4956A] text-white px-6 py-2.5 rounded-lg font-semibold text-sm">목록으로</Link>
      </div>
    );
  }

  // ── 금액 계산 ──────────────────────────────────────────────────────
  const totalQty    = quote.colors.reduce((a, c) => a + c.sizes.reduce((b, s) => b + s.quantity, 0), 0);
  const subtotal    = quote.colors.reduce((a, c) => a + c.sizes.reduce((b, s) => b + s.quantity * s.unitPrice, 0), 0);
  const isFree      = quote.freeShippingThreshold > 0 && subtotal >= quote.freeShippingThreshold;
  const totalAmount = subtotal + (isFree ? 0 : quote.shippingFee);
  const status      = statusConfig[quote.status];

  // ── 완료 화면 ──────────────────────────────────────────────────────
  if (done) {
    const doneConfig = {
      approved:    { icon: <CheckCircle size={36} className="text-green-500" />, bg: "bg-green-50", title: "견적을 채택했습니다", sub: "공급사에게 알림이 전송되었습니다. 주문이 확정되면 발주 내역에서 확인하세요.", cta: "/buyer/orders" , ctaLabel: "발주 내역 확인" },
      rejected:    { icon: <XCircle size={36} className="text-red-500" />,       bg: "bg-red-50",   title: "견적을 거절했습니다", sub: "공급사에게 거절 알림이 전송되었습니다. 다른 견적을 계속 검토하세요.", cta: "/buyer/my-sourcing", ctaLabel: "소싱 목록으로" },
      negotiated:  { icon: <MessageCircle size={36} className="text-purple-500" />, bg: "bg-purple-50", title: "협의 요청을 보냈습니다", sub: "공급사가 검토 후 답변드립니다. 협의 내역은 소싱 요청 상세에서 확인할 수 있습니다.", cta: "/buyer/my-sourcing", ctaLabel: "소싱 목록으로" },
    }[done];
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-border rounded-xl p-10">
          <div className={`w-16 h-16 ${doneConfig.bg} rounded-full flex items-center justify-center mx-auto mb-5`}>{doneConfig.icon}</div>
          <h2 className="text-2xl font-bold text-foreground mb-3">{doneConfig.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-8">{doneConfig.sub}</p>
          <div className="flex justify-center gap-3">
            <Link to={doneConfig.cta} className="bg-[#C4956A] hover:bg-[#b3845a] text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors">{doneConfig.ctaLabel}</Link>
            <Link to="/buyer/my-sourcing" className="border border-border text-foreground hover:border-[#C4956A] hover:text-[#C4956A] px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">소싱 목록으로</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 font-[Inter,sans-serif]">

      {/* 상단 네비 */}
      <div className="mb-6">
        <Link to="/buyer/my-sourcing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ChevronLeft size={16} /> 소싱 요청 목록으로
        </Link>

        {/* 헤더 카드 */}
        <div className="bg-gradient-to-r from-[#1C1C1C] to-[#2a2a2a] text-white rounded-xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <FileText size={22} className="text-[#C4956A]" />
                <h1 className="text-xl font-bold">견적서 상세</h1>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.bg} ${status.color}`}>
                  {status.icon} {status.label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="font-mono">{quote.id}</span>
                <span>소싱 요청 <span className="text-white font-medium">{quote.requestId}</span></span>
                <span>제출일 {quote.submittedAt}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-gray-400 mb-0.5">견적 유효기간</div>
              <div className="flex items-center gap-1.5 text-sm font-semibold">
                <Clock size={14} className="text-[#C4956A]" />
                <span className="text-white">{quote.validUntil}까지</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">

        {/* 소싱 요청 원문 */}
        <section className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Info size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">내 소싱 요청 원문</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              { label: "카테고리",  value: "상의 (블라우스)" },
              { label: "희망 수량", value: "200벌 이상" },
              { label: "희망 납기", value: "7일 이내" },
              { label: "희망 단가", value: "₩15,000 이하" },
            ].map((r) => (
              <div key={r.label}>
                <div className="text-blue-500 text-xs mb-0.5">{r.label}</div>
                <div className="text-blue-900 font-medium">{r.value}</div>
              </div>
            ))}
          </div>
          <div className="text-xs text-blue-700 mt-3 pt-3 border-t border-blue-200">
            요청 메모: 린넨 소재 여름 블라우스, 화이트·베이지 컬러 선호, 샘플 먼저 확인 희망
          </div>
        </section>

        {/* 공급사 정보 */}
        <section className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Building2 size={15} className="text-[#C4956A]" />
            <h2 className="text-sm font-semibold text-foreground">공급사 정보</h2>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#C4956A]/10 flex items-center justify-center flex-shrink-0">
                <Building2 size={24} className="text-[#C4956A]" />
              </div>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">브랜드 / 매장</div>
                  <div className="font-semibold text-foreground">{quote.seller.storeName}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{quote.seller.location}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">평점</div>
                  <StarRating rating={quote.seller.rating} />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">누적 발주</div>
                  <div className="font-medium text-foreground">{quote.seller.totalOrders.toLocaleString()}건</div>
                  <div className="text-xs text-muted-foreground">재주문율 {quote.seller.reorderRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">업력</div>
                  <div className="font-medium text-foreground">{new Date().getFullYear() - quote.seller.established}년</div>
                  <div className="text-xs text-muted-foreground">{quote.seller.established}년 창업</div>
                </div>
              </div>
            </div>
            {/* 뱃지 */}
            <div className="flex gap-2 flex-wrap mt-4 pt-4 border-t border-border">
              {quote.seller.badges.map((b) => (
                <span key={b} className="flex items-center gap-1 text-xs bg-[#FAF9F7] border border-[#C4956A]/20 text-[#C4956A] px-2.5 py-1 rounded-full font-medium">
                  <ShieldCheck size={11} /> {b}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 상품 기본 정보 */}
        <section className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Package size={15} className="text-[#C4956A]" />
            <h2 className="text-sm font-semibold text-foreground">상품 정보</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {[
                { label: "브랜드명",   value: quote.brandName },
                { label: "상품명",     value: quote.productName },
                { label: "카테고리",   value: quote.category },
                { label: "소재",       value: quote.material },
                { label: "원산지",     value: quote.origin },
                { label: "출고 소요일", value: quote.leadTime, highlight: true },
              ].map((r) => (
                <div key={r.label}>
                  <div className="text-xs text-muted-foreground mb-0.5">{r.label}</div>
                  <div className={`font-medium ${r.highlight ? "text-[#C4956A]" : "text-foreground"}`}>{r.value || "—"}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 컬러 · 사이즈별 수량 및 단가 */}
        <section className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={15} className="text-[#C4956A]" />
              <h2 className="text-sm font-semibold text-foreground">컬러 · 사이즈별 수량 및 단가</h2>
            </div>
            <div className="text-xs text-muted-foreground">총 {totalQty.toLocaleString()}장</div>
          </div>
          <div className="divide-y divide-border">
            {quote.colors.map((color) => {
              const colorTotal = color.sizes.reduce((a, s) => a + s.quantity * s.unitPrice, 0);
              const colorQty   = color.sizes.reduce((a, s) => a + s.quantity, 0);
              const isOpen     = expandedColor === color.color;
              return (
                <div key={color.color}>
                  {/* 컬러 헤더 */}
                  <button
                    onClick={() => setExpandedColor(isOpen ? null : color.color)}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors text-left"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-border flex-shrink-0"
                      style={{ background: color.color === "화이트" ? "#FAF9F7" : color.color === "베이지" ? "#D4C5A9" : color.color === "블랙" ? "#1C1C1C" : "#C4956A" }} />
                    <span className="font-medium text-sm text-foreground flex-1">{color.color}</span>
                    <span className="text-xs text-muted-foreground">{colorQty.toLocaleString()}장</span>
                    <span className="font-mono text-sm font-bold text-foreground">₩{colorTotal.toLocaleString()}</span>
                    {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
                  </button>
                  {/* 사이즈 테이블 */}
                  {isOpen && (
                    <div className="px-5 pb-4 bg-muted/10">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-4">사이즈</th>
                            <th className="text-right text-xs font-medium text-muted-foreground pb-2 pr-4">수량</th>
                            <th className="text-right text-xs font-medium text-muted-foreground pb-2 pr-4">도매 단가</th>
                            <th className="text-right text-xs font-medium text-muted-foreground pb-2">소계</th>
                          </tr>
                        </thead>
                        <tbody>
                          {color.sizes.map((sz, si) => (
                            <tr key={si} className="border-b border-border/40 last:border-0">
                              <td className="py-2 pr-4 font-medium text-foreground">{sz.size}</td>
                              <td className="py-2 pr-4 text-right text-muted-foreground font-mono">{sz.quantity.toLocaleString()}장</td>
                              <td className="py-2 pr-4 text-right text-[#C4956A] font-bold font-mono">₩{sz.unitPrice.toLocaleString()}</td>
                              <td className="py-2 text-right font-mono font-bold text-foreground">₩{(sz.quantity * sz.unitPrice).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-border">
                            <td colSpan={2} className="pt-2 text-xs text-muted-foreground">소계</td>
                            <td className="pt-2 text-right font-mono text-xs text-muted-foreground">{colorQty.toLocaleString()}장</td>
                            <td className="pt-2 text-right font-mono font-bold text-foreground">₩{colorTotal.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 배송 정보 */}
        <section className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Truck size={15} className="text-[#C4956A]" />
            <h2 className="text-sm font-semibold text-foreground">배송 정보</h2>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">택배사</div>
              <div className="font-medium text-foreground">{quote.shippingCompany}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">기본 택배비</div>
              <div className="font-medium text-foreground">₩{quote.shippingFee.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">무료배송 기준</div>
              <div className="font-medium text-foreground">
                {quote.freeShippingThreshold > 0 ? `₩${quote.freeShippingThreshold.toLocaleString()} 이상` : "해당 없음"}
              </div>
            </div>
          </div>
        </section>

        {/* 견적 조건 */}
        <section className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Calendar size={15} className="text-[#C4956A]" />
            <h2 className="text-sm font-semibold text-foreground">견적 조건</h2>
          </div>
          <div className="p-5 space-y-4">
            {/* 샘플 */}
            <div className="flex items-start gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${
                quote.sampleAvailable
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : "bg-muted border-border text-muted-foreground"
              }`}>
                <FlaskConical size={14} />
                {quote.sampleAvailable
                  ? `샘플 제공 가능 · ₩${quote.samplePrice.toLocaleString()}/장`
                  : "샘플 제공 불가"}
              </div>
            </div>
            {/* 반품 정책 */}
            {quote.returnPolicy && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1.5">반품 · 교환 정책</div>
                <div className="text-sm text-foreground bg-muted/30 rounded-lg px-4 py-3 leading-relaxed">{quote.returnPolicy}</div>
              </div>
            )}
            {/* 셀러 메모 */}
            {quote.notes && (
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1.5">공급사 메모</div>
                <div className="text-sm text-foreground bg-[#FAF9F7] border border-[#C4956A]/20 rounded-lg px-4 py-3 leading-relaxed">{quote.notes}</div>
              </div>
            )}
          </div>
        </section>

        {/* 견적 최종 금액 */}
        <section className="bg-white border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <Clock size={15} className="text-[#C4956A]" />
            <h2 className="text-sm font-semibold text-foreground">견적 금액 요약</h2>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>상품 금액 ({totalQty.toLocaleString()}장)</span>
              <span className="font-mono">₩{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>
                택배비
                {isFree && <span className="ml-1.5 text-xs text-green-600 font-medium">무료배송 적용</span>}
              </span>
              <span className="font-mono">{isFree ? "₩0" : `₩${quote.shippingFee.toLocaleString()}`}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
              <span>견적 총액</span>
              <span className="font-mono text-xl text-[#C4956A]">₩{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>출고 소요일</span>
              <span>{quote.leadTime}</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>견적 유효기간</span>
              <span>{quote.validUntil}까지</span>
            </div>
          </div>
        </section>

        {/* 주의사항 */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
          <AlertCircle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 leading-relaxed">
            <span className="font-semibold">채택 전 확인하세요 — </span>
            견적 채택 후에는 단가·택배비 등의 내용을 수정하기 어렵습니다. 샘플 수령을 원하시면 채택 후 발주 화면에서 샘플 먼저 받아보기 옵션을 선택하세요.
          </div>
        </div>

        {/* 액션 버튼 */}
        {quote.status === "REVIEWING" && !action && (
          <div className="flex items-center gap-3 justify-end pb-4">
            <button onClick={() => setAction("reject")}
              className="flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <XCircle size={15} /> 거절
            </button>
            <button onClick={() => setAction("negotiate")}
              className="flex items-center gap-2 border border-purple-200 text-purple-600 hover:bg-purple-50 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
              <MessageCircle size={15} /> 협의 요청
            </button>
            <button onClick={() => setAction("approve")}
              className="flex items-center gap-2 bg-[#C4956A] hover:bg-[#b3845a] text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors">
              <CheckCircle size={15} /> 견적 채택
            </button>
            <button className="flex items-center gap-2 border border-border text-muted-foreground hover:border-[#C4956A] hover:text-[#C4956A] px-4 py-2.5 rounded-lg text-sm transition-colors">
              <Download size={15} /> PDF
            </button>
          </div>
        )}

        {/* ── 채택 확인 인라인 ── */}
        {action === "approve" && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle size={16} className="text-green-600" />
              <h3 className="text-sm font-bold text-green-800">견적을 채택하시겠습니까?</h3>
            </div>
            <p className="text-xs text-green-700 leading-relaxed mb-4">
              채택 후에는 단가·수량 등 견적 내용 수정이 불가합니다.<br />
              채택 확정 시 공급사에게 알림이 전송되고 주문이 생성됩니다.
            </p>
            <div className="bg-white border border-green-200 rounded-lg px-4 py-3 text-sm mb-4">
              <div className="font-semibold text-foreground mb-1">{quote.brandName} · {quote.productName}</div>
              <div className="text-muted-foreground">총 {totalQty.toLocaleString()}장 · 견적 총액 <span className="text-[#C4956A] font-bold">₩{totalAmount.toLocaleString()}</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAction(null)} className="flex-1 border border-border text-foreground hover:border-[#C4956A] py-2.5 rounded-lg text-sm font-medium transition-colors">취소</button>
              <button onClick={() => setDone("approved")} className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">채택 확정</button>
            </div>
          </div>
        )}

        {/* ── 거절 인라인 ── */}
        {action === "reject" && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle size={16} className="text-red-600" />
              <h3 className="text-sm font-bold text-red-800">견적을 거절하시겠습니까?</h3>
            </div>
            <p className="text-xs text-red-700 leading-relaxed mb-4">거절 사유를 입력하면 공급사에게 전달됩니다. (선택사항)</p>
            <textarea rows={3} placeholder="예: 단가가 희망 예산을 초과합니다." className="w-full border border-red-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-400 resize-none bg-white mb-3" />
            <div className="flex gap-2">
              <button onClick={() => setAction(null)} className="flex-1 border border-border text-foreground hover:border-red-300 py-2.5 rounded-lg text-sm font-medium transition-colors">취소</button>
              <button onClick={() => setDone("rejected")} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors">거절 확정</button>
            </div>
          </div>
        )}

        {/* ── 협의 요청 인라인 ── */}
        {action === "negotiate" && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle size={16} className="text-purple-600" />
              <h3 className="text-sm font-bold text-purple-800">협의 요청 내용 작성</h3>
            </div>
            <p className="text-xs text-purple-700 leading-relaxed mb-3">단가·수량·납기 등 수정이 필요한 부분을 구체적으로 작성해 주세요.</p>
            <div className="mb-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">협의 유형</label>
              <select className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 bg-white">
                <option>단가 협의</option>
                <option>수량 조정</option>
                <option>납기 단축</option>
                <option>컬러 추가/변경</option>
                <option>기타</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">협의 내용 <span className="text-red-500">*</span></label>
              <textarea
                rows={4}
                value={negotiateText}
                onChange={(e) => setNegotiateText(e.target.value)}
                placeholder="예: 단가를 ₩11,000으로 조정 가능한지 협의 요청드립니다. 물량 300장으로 증량 가능합니다."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-400 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setAction(null)} className="flex-1 border border-border text-foreground py-2.5 rounded-lg text-sm font-medium transition-colors">취소</button>
              <button
                onClick={() => negotiateText.trim() && setDone("negotiated")}
                disabled={!negotiateText.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <PenLine size={14} /> 협의 요청 전송
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
