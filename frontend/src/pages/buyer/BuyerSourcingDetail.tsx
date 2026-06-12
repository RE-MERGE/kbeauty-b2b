import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft, Package, FileText, FlaskConical, Clock,
  CheckCircle, XCircle, MessageSquare, CreditCard,
  ChevronRight, RotateCcw, X, Truck, BadgeCheck,
  CircleDot, AlertTriangle,
} from "lucide-react";
import { DUMMY_REQUESTS, SourcingRequest, Bid } from "./BuyerSourcingList";

// ── 타입 ──────────────────────────────────────────────────────────────
type RequestStatus = "대기중" | "견적수신" | "승인" | "거절" | "재요청됨" | "협의중";
type BidStatus = "검토중" | "승인" | "거절" | "협의중" | "샘플대기중" | "샘플발송됨";

const REQUEST_STATUS_STYLE: Record<RequestStatus, string> = {
  "대기중":   "bg-secondary text-muted-foreground border-border",
  "견적수신": "bg-blue-50 text-blue-600 border-blue-200",
  "승인":     "bg-green-50 text-green-600 border-green-200",
  "거절":     "bg-red-50 text-red-500 border-red-200",
  "재요청됨": "bg-amber-50 text-amber-600 border-amber-200",
  "협의중":   "bg-purple-50 text-purple-600 border-purple-200",
};

const BID_STATUS_STYLE: Record<BidStatus, string> = {
  "검토중":     "bg-secondary text-muted-foreground border-border",
  "승인":       "bg-green-50 text-green-600 border-green-200",
  "거절":       "bg-red-50 text-red-500 border-red-200",
  "협의중":     "bg-purple-50 text-purple-600 border-purple-200",
  "샘플대기중": "bg-amber-50 text-amber-600 border-amber-200",
  "샘플발송됨": "bg-teal-50 text-teal-600 border-teal-200",
};

const BID_STATUS_ICON: Partial<Record<BidStatus, React.ReactNode>> = {
  "검토중":     <CircleDot size={11} />,
  "승인":       <BadgeCheck size={11} />,
  "거절":       <XCircle size={11} />,
  "협의중":     <MessageSquare size={11} />,
  "샘플대기중": <Clock size={11} />,
  "샘플발송됨": <Truck size={11} />,
};

// ── 샘플 결제 모달 ────────────────────────────────────────────────────
function SamplePaymentModal({
  bid, request, onClose, onPaid,
}: {
  bid: Bid; request: SourcingRequest;
  onClose: () => void; onPaid: (bidId: string) => void;
}) {
  const [step, setStep] = useState<"confirm" | "paying" | "done">("confirm");
  const samplePrice = bid.samplePrice ?? 0;

  const handlePay = () => {
    setStep("paying");
    setTimeout(() => { onPaid(bid.bidId); setStep("done"); }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={step !== "paying" ? onClose : undefined} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <FlaskConical size={16} className="text-amber-500" />
            <h3 className="font-bold text-foreground">샘플 결제</h3>
          </div>
          {step !== "paying" && <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={18} /></button>}
        </div>

        {step === "done" ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={22} className="text-amber-500" />
            </div>
            <div className="font-bold text-foreground mb-1">샘플 결제 완료!</div>
            <div className="text-sm text-muted-foreground mb-6">공급사에게 알림이 전송됩니다.<br />샘플 출고 후 수령 확인이 가능합니다.</div>
            <button onClick={onClose} className="px-6 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-primary/90 transition-colors">확인</button>
          </div>
        ) : step === "paying" ? (
          <div className="px-6 py-10 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <CreditCard size={22} className="text-primary" />
            </div>
            <div className="font-bold text-foreground mb-1">결제 처리 중...</div>
            <div className="text-sm text-muted-foreground">잠시만 기다려주세요.</div>
          </div>
        ) : (
          <div className="px-6 py-5 space-y-4">
            <div className="bg-secondary rounded-lg p-4 space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">공급사</span>
                <span className="font-semibold text-foreground">{bid.supplierName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">상품명</span>
                <span className="font-semibold text-foreground truncate ml-4">{request.productName}</span>
              </div>
              <div className="border-t border-border pt-2.5 flex justify-between">
                <span className="text-sm font-semibold text-foreground">샘플비</span>
                <span className="font-bold text-lg text-foreground">{samplePrice.toLocaleString()}원</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground bg-amber-50 border border-amber-200 rounded px-3 py-2.5 leading-relaxed">
              샘플비는 수령 후 발주 진행 여부와 무관하게 환불되지 않습니다.
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 border border-border rounded text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors font-medium">취소</button>
              <button onClick={handlePay} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-2">
                <CreditCard size={14} /> {samplePrice.toLocaleString()}원 결제
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 견적 상세 모달 ────────────────────────────────────────────────────
function BidDetailModal({
  request, bid, onClose, onAction, onSampleRequest, onNavigateNegotiation,
}: {
  request: SourcingRequest; bid: Bid;
  onClose: () => void;
  onAction: (bidId: string, action: "승인" | "거절") => void;
  onSampleRequest: (bid: Bid) => void;
  onNavigateNegotiation: () => void;
}) {
  const [confirmed, setConfirmed] = useState<"승인" | "거절" | null>(null);
  const needSample = request.needSample === "Y";

  const handleAction = (action: "승인" | "거절") => {
    onAction(bid.bidId, action);
    setConfirmed(action);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[460px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <div className="text-xs text-muted-foreground font-mono mb-0.5">{bid.bidId}</div>
            <h3 className="font-bold text-foreground">{bid.supplierName}의 견적</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${BID_STATUS_STYLE[bid.status]}`}>
              {BID_STATUS_ICON[bid.status]} {bid.status}
            </span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={18} /></button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {confirmed ? (
            <div className="py-8 text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmed === "승인" ? "bg-green-100" : "bg-red-100"}`}>
                {confirmed === "승인"
                  ? <CheckCircle size={22} className="text-green-500" />
                  : <XCircle size={22} className="text-red-500" />}
              </div>
              <div className="font-bold text-foreground mb-1">
                {confirmed === "승인" ? "견적이 승인되었습니다!" : "견적이 거절되었습니다."}
              </div>
              {confirmed === "승인" && (
                <div className="text-sm text-muted-foreground mt-2 mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-left">
                  <div className="font-semibold text-green-700 mb-1 flex items-center gap-1.5"><BadgeCheck size={13} /> 다음 단계 안내</div>
                  <div className="text-xs text-green-700 leading-relaxed">
                    셀러에게 계약서가 발송됩니다.<br />
                    계약 완료 후 <span className="font-semibold">주문 내역</span>에서 진행 상황을 확인하실 수 있습니다.
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-center">
                <button onClick={onClose} className="px-5 py-2 bg-primary text-white rounded font-semibold text-sm hover:bg-primary/90 transition-colors">확인</button>
                {confirmed === "승인" && (
                  <button
                    onClick={() => { onClose(); }}
                    className="px-5 py-2 border border-border text-muted-foreground rounded font-semibold text-sm hover:border-primary hover:text-primary transition-colors"
                  >
                    주문 내역 보기
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 핵심 수치 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-0.5">제시 총예산</div>
                  <div className="font-bold text-foreground">{((bid.totalBudget ?? 0) / 10000).toLocaleString()}만원</div>
                  {request.totalBudget && (
                    <div className={`text-[10px] mt-0.5 font-medium ${bid.totalBudget! <= request.totalBudget ? "text-green-600" : "text-red-500"}`}>
                      희망 대비 {bid.totalBudget! <= request.totalBudget
                        ? `▼ ${((request.totalBudget - bid.totalBudget!) / 10000).toLocaleString()}만원`
                        : `▲ ${((bid.totalBudget! - request.totalBudget) / 10000).toLocaleString()}만원`}
                    </div>
                  )}
                </div>
                <div className="bg-secondary rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-0.5">납품 가능일</div>
                  <div className="font-bold text-foreground">{bid.availableDate}</div>
                  <div className={`text-[10px] mt-0.5 font-medium ${bid.availableDate <= request.deliveryDate ? "text-green-600" : "text-red-500"}`}>
                    {bid.availableDate <= request.deliveryDate ? "납기 충족" : "납기 초과"}
                  </div>
                </div>
                {bid.samplePrice != null && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center col-span-2">
                    <div className="text-xs text-amber-600 mb-0.5">샘플비</div>
                    <div className="font-bold text-amber-700">{bid.samplePrice.toLocaleString()}원</div>
                    <div className="text-[10px] text-amber-500 mt-0.5">승인 전 샘플 수령 필요</div>
                  </div>
                )}
              </div>

              {/* 공급사 메모 */}
              {bid.comment && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">공급사 메모</div>
                  <div className="bg-secondary rounded-lg px-4 py-3 text-sm text-foreground leading-relaxed">{bid.comment}</div>
                </div>
              )}

              {/* 견적서 */}
              {bid.quoteFileUrl && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1.5">견적서</div>
                  <div className="flex items-center gap-3 border border-border rounded px-3 py-2 bg-secondary hover:border-primary transition-colors cursor-pointer group/file">
                    <FileText size={14} className="text-primary flex-shrink-0" />
                    <span className="text-sm text-foreground flex-1">{bid.quoteFileUrl}</span>
                    <span className="text-xs text-primary opacity-0 group-hover/file:opacity-100 transition-opacity">다운로드</span>
                  </div>
                </div>
              )}

              {/* 액션 버튼 — 검토중 */}
              {bid.status === "검토중" && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAction("거절")}
                    className="py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <XCircle size={14} /> 거절
                  </button>
                  <button
                    onClick={onNavigateNegotiation}
                    className="py-2.5 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} /> 협의하기
                  </button>
                  {needSample ? (
                    <button
                      onClick={() => onSampleRequest(bid)}
                      className="py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FlaskConical size={14} /> 샘플 요청
                    </button>
                  ) : (
                    <button
                      onClick={() => handleAction("승인")}
                      className="py-2.5 bg-primary hover:bg-primary/90 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={14} /> 승인
                    </button>
                  )}
                </div>
              )}

              {/* 샘플 발송됨 — 거절 or 승인 */}
              {bid.status === "샘플발송됨" && (
                <div className="space-y-2">
                  <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 text-sm text-teal-700 flex items-center gap-2">
                    <Truck size={14} /> 샘플이 발송되었습니다. 수령 후 결정해주세요.
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAction("거절")}
                      className="py-2.5 border border-red-200 text-red-500 hover:bg-red-50 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={14} /> 거절
                    </button>
                    <button
                      onClick={() => handleAction("승인")}
                      className="py-2.5 bg-primary hover:bg-primary/90 text-white rounded font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={14} /> 승인
                    </button>
                  </div>
                </div>
              )}

              {bid.status === "샘플대기중" && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                  <Clock size={14} /> 공급사가 샘플을 준비 중입니다.
                </div>
              )}

              {(bid.status === "승인" || bid.status === "거절") && (
                <div className={`text-center py-3 rounded-lg text-sm font-medium border ${BID_STATUS_STYLE[bid.status]}`}>
                  이 견적은 <strong>{bid.status}</strong> 상태입니다
                </div>
              )}

              {bid.status === "협의중" && (
                <div className="space-y-2">
                  <div className={`text-center py-3 rounded-lg text-sm font-medium border ${BID_STATUS_STYLE[bid.status]}`}>
                    협의 진행 중입니다
                  </div>
                  <button
                    onClick={onNavigateNegotiation}
                    className="w-full py-2.5 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} /> 협의 내용 보기
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 공급사 그룹 카드 ──────────────────────────────────────────────────
function SupplierGroup({
  supplierName, bids, request, onSelectBid, onNavigateNegotiation,
}: {
  supplierName: string;
  bids: Bid[];
  request: SourcingRequest;
  onSelectBid: (bid: Bid) => void;
  onNavigateNegotiation: () => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const sorted = [...bids].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));

  // 대표 상태
  const repStatus: BidStatus = (() => {
    const priority: BidStatus[] = ["승인", "샘플발송됨", "샘플대기중", "협의중", "검토중", "거절"];
    for (const p of priority) if (bids.some((b) => b.status === p)) return p;
    return bids[0].status;
  })();

  const latest = sorted[0];
  const budgetDiff = request.totalBudget ? request.totalBudget - (latest.totalBudget ?? 0) : null;

  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden">
      {/* 공급사 헤더 */}
      <div className="px-5 py-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-bold text-foreground">{supplierName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${BID_STATUS_STYLE[repStatus]}`}>
              {BID_STATUS_ICON[repStatus]} {repStatus}
            </span>
            {bids.length > 1 && (
              <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                견적 {bids.length}건
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            최신: {((latest.totalBudget ?? 0) / 10000).toLocaleString()}만원 · {latest.availableDate} 납품
            {budgetDiff !== null && (
              <span className={`ml-1.5 font-semibold ${budgetDiff >= 0 ? "text-green-600" : "text-red-500"}`}>
                ({budgetDiff >= 0 ? `▼ ${(budgetDiff / 10000).toLocaleString()}만` : `▲ ${(Math.abs(budgetDiff) / 10000).toLocaleString()}만`})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* 협의하기 버튼 */}
          <button
            onClick={onNavigateNegotiation}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-lg text-xs font-semibold transition-colors"
          >
            <MessageSquare size={12} /> 협의하기
          </button>
          {/* 토글 */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded border border-border hover:border-primary"
          >
            <ChevronRight size={13} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
            {expanded ? "접기" : "펼치기"}
          </button>
        </div>
      </div>

      {/* 견적 목록 */}
      {expanded && (
        <div className="border-t border-border divide-y divide-border">
          {sorted.map((bid, idx) => {
            const isLatest = idx === 0;
            const diff = request.totalBudget ? request.totalBudget - (bid.totalBudget ?? 0) : null;
            const dateOk = bid.availableDate <= request.deliveryDate;

            return (
              <div key={bid.bidId} className="px-5 py-4 bg-secondary/20 hover:bg-secondary/40 transition-colors">
                {/* 견적 번호 + 상태 */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLatest ? "bg-primary" : "bg-border"}`} />
                    <span className={`text-xs font-semibold ${isLatest ? "text-primary" : "text-muted-foreground"}`}>
                      {isLatest ? "최신 견적" : `이전 견적 ${sorted.length - idx}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{bid.submittedAt} 제출</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium flex items-center gap-1 ${BID_STATUS_STYLE[bid.status]}`}>
                    {BID_STATUS_ICON[bid.status]} {bid.status}
                  </span>
                </div>

                {/* 수치 요약 */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="bg-white rounded-lg p-2.5 text-center border border-border">
                    <div className="text-[10px] text-muted-foreground mb-0.5">제시 예산</div>
                    <div className="font-bold text-sm text-foreground">{((bid.totalBudget ?? 0) / 10000).toLocaleString()}만</div>
                    {diff !== null && (
                      <div className={`text-[10px] font-medium ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {diff >= 0 ? `▼ ${(diff / 10000).toLocaleString()}만` : `▲ ${(Math.abs(diff) / 10000).toLocaleString()}만`}
                      </div>
                    )}
                  </div>
                  <div className="bg-white rounded-lg p-2.5 text-center border border-border">
                    <div className="text-[10px] text-muted-foreground mb-0.5">납품 가능일</div>
                    <div className="font-bold text-sm text-foreground">{bid.availableDate.slice(5)}</div>
                    <div className={`text-[10px] font-medium ${dateOk ? "text-green-600" : "text-red-500"}`}>
                      {dateOk ? "납기 충족" : "납기 초과"}
                    </div>
                  </div>
                  <div className={`rounded-lg p-2.5 text-center border ${bid.samplePrice != null ? "bg-amber-50 border-amber-200" : "bg-white border-border"}`}>
                    <div className={`text-[10px] mb-0.5 ${bid.samplePrice != null ? "text-amber-600" : "text-muted-foreground"}`}>샘플비</div>
                    <div className={`font-bold text-sm ${bid.samplePrice != null ? "text-amber-700" : "text-muted-foreground"}`}>
                      {bid.samplePrice != null ? `${bid.samplePrice.toLocaleString()}원` : "—"}
                    </div>
                  </div>
                </div>

                {/* 메모 + 견적서 */}
                {bid.comment && (
                  <div className="text-xs text-muted-foreground bg-white rounded px-3 py-2 border border-border mb-2 line-clamp-2">
                    {bid.comment}
                  </div>
                )}
                {bid.quoteFileUrl && (
                  <div className="flex items-center gap-1.5 text-xs text-primary mb-3">
                    <FileText size={11} /> {bid.quoteFileUrl}
                  </div>
                )}

                {/* 상세보기 버튼 */}
                <button
                  onClick={() => onSelectBid(bid)}
                  className="w-full py-2 border border-border rounded-lg text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1.5"
                >
                  상세보기 <ChevronRight size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ───────────────────────────────────────────────────────
export function BuyerSourcingDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const requestId = (location.state as any)?.requestId ?? "CUS-001";

  const initial = DUMMY_REQUESTS.find((r) => r.id === requestId) ?? DUMMY_REQUESTS.find((r) => r.type === "CUSTOM")!;
  const [requests, setRequests] = useState(DUMMY_REQUESTS);
  const currentRequest = requests.find((r) => r.id === initial.id) ?? initial;

  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [samplePayBid, setSamplePayBid] = useState<Bid | null>(null);

  const handleBidAction = (bidId: string, action: "승인" | "거절") => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== currentRequest.id) return req;
        const newBids = req.bids.map((b) => b.bidId === bidId ? { ...b, status: action as BidStatus } : b);
        const newStatus: RequestStatus = action === "승인" ? "승인" : req.status;
        return { ...req, bids: newBids, status: newStatus };
      })
    );
  };

  const handleSamplePaid = (bidId: string) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id !== currentRequest.id) return req;
        const newBids = req.bids.map((b) => b.bidId === bidId ? { ...b, status: "샘플대기중" as BidStatus } : b);
        return { ...req, bids: newBids };
      })
    );
    setSamplePayBid(null);
  };

  const handleRerequest = () => {
    navigate("/sourcing-request", {
      state: { prefillItem: currentRequest.prefillData, isRerequest: true, originalRequestId: currentRequest.id },
    });
  };

  // 공급사별 그룹핑
  const supplierGroups = Object.entries(
    currentRequest.bids.reduce<Record<string, Bid[]>>((acc, bid) => {
      (acc[bid.supplierName] ??= []).push(bid);
      return acc;
    }, {})
  );

  const approvedBid = currentRequest.bids.find((b) => b.status === "승인");

  return (
    <div className="max-w-[860px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* 뒤로가기 */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
        <ArrowLeft size={15} /> 소싱 요청 목록
      </button>

      {/* ── 요청 정보 카드 ─────────────────────────────────────────── */}
      <div className="bg-white border border-border rounded-xl overflow-hidden mb-6">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-xs text-muted-foreground font-mono">{currentRequest.id}</span>
                <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded font-medium">
                  {currentRequest.type === "CUSTOM" ? "✂️ 주문제작" : "🏷️ 기성품"}
                </span>
                {currentRequest.mainCategory && (
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded">
                    {currentRequest.mainCategory}{currentRequest.subCategory ? ` > ${currentRequest.subCategory}` : ""}
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${REQUEST_STATUS_STYLE[currentRequest.status]}`}>
                  {currentRequest.status}
                </span>
              </div>
              <h1 className="text-xl font-bold text-foreground mb-1">{currentRequest.productName}</h1>
              <div className="text-xs text-muted-foreground">{currentRequest.createdAt} 등록</div>
            </div>
            {["대기중", "견적수신"].includes(currentRequest.status) && (
              <button
                onClick={handleRerequest}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 border-2 border-dashed border-border hover:border-primary text-muted-foreground hover:text-primary rounded-lg text-xs font-medium transition-colors"
              >
                <RotateCcw size={12} /> 재요청
              </button>
            )}
          </div>
        </div>

        {/* 핵심 수치 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-border border-b border-border">
          {[
            { label: "희망 수량", value: `${currentRequest.quantity.toLocaleString()}벌`, icon: <Package size={13} /> },
            { label: currentRequest.type === "CUSTOM" ? "전체 예산" : "희망 단가",
              value: currentRequest.type === "CUSTOM"
                ? `${((currentRequest.totalBudget ?? 0) / 10000).toLocaleString()}만원`
                : `${currentRequest.unitPrice?.toLocaleString()}원`,
              icon: <CreditCard size={13} /> },
            { label: "희망 납기", value: currentRequest.deliveryDate, icon: null },
            { label: "샘플", value: currentRequest.needSample === "Y" ? "필요" : "불필요",
              icon: <FlaskConical size={13} />, highlight: currentRequest.needSample === "Y" },
          ].map(({ label, value, icon, highlight }) => (
            <div key={label} className="px-5 py-4 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground mb-1">{icon} {label}</div>
              <div className={`font-bold text-sm ${highlight ? "text-amber-600" : "text-foreground"}`}>{value}</div>
            </div>
          ))}
        </div>

        {/* 세부 내용 + 작업지시서 */}
        <div className="px-6 py-5 grid sm:grid-cols-2 gap-5">
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">요청 상세</div>
            <div className="bg-secondary rounded-lg px-4 py-3 text-sm text-foreground leading-relaxed whitespace-pre-line">
              {currentRequest.detail || "—"}
            </div>
          </div>
          {(currentRequest.workFileCount ?? 0) > 0 && (
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                작업지시서 ({currentRequest.workFileCount}건)
              </div>
              <div className="space-y-1.5">
                {Array.from({ length: currentRequest.workFileCount ?? 0 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 border border-border rounded px-3 py-2 bg-secondary hover:border-primary transition-colors cursor-pointer group/file">
                    <FileText size={13} className="text-primary flex-shrink-0" />
                    <span className="text-xs text-foreground flex-1">작업지시서_{currentRequest.id}_{i + 1}.pdf</span>
                    <span className="text-xs text-primary opacity-0 group-hover/file:opacity-100 transition-opacity">다운로드</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── 견적 목록 ──────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-foreground">접수된 견적</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${currentRequest.bids.length > 0 ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
              {supplierGroups.length}개사 · {currentRequest.bids.length}건
            </span>
          </div>
          {approvedBid && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 border border-green-200 rounded-full px-3 py-1 font-medium">
              <BadgeCheck size={12} /> {approvedBid.supplierName} 승인 완료
            </div>
          )}
        </div>

        {currentRequest.bids.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-white border border-border rounded-xl">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-medium mb-1">아직 접수된 견적이 없습니다</div>
            <div className="text-sm">공급사들이 견적을 제출하면 이곳에 표시됩니다.</div>
            {currentRequest.status === "대기중" && (
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
                <AlertTriangle size={11} /> 견적 수신까지 시간이 걸릴 수 있습니다
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {supplierGroups.map(([supplierName, bids]) => (
              <SupplierGroup
                key={supplierName}
                supplierName={supplierName}
                bids={bids}
                request={currentRequest}
                onSelectBid={setSelectedBid}
                onNavigateNegotiation={() => navigate("/negotiations", { state: { supplierId: supplierName, requestId: currentRequest.id } })}
              />
            ))}
          </div>
        )}
      </div>

      {/* 견적 상세 모달 */}
      {selectedBid && !samplePayBid && (
        <BidDetailModal
          request={currentRequest}
          bid={selectedBid}
          onClose={() => setSelectedBid(null)}
          onAction={handleBidAction}
          onSampleRequest={(bid) => { setSelectedBid(null); setSamplePayBid(bid); }}
          onNavigateNegotiation={() => navigate("/negotiations", { state: { supplierId: selectedBid.supplierName, requestId: currentRequest.id } })}
        />
      )}

      {/* 샘플 결제 모달 */}
      {samplePayBid && (
        <SamplePaymentModal
          bid={samplePayBid}
          request={currentRequest}
          onClose={() => setSamplePayBid(null)}
          onPaid={handleSamplePaid}
        />
      )}
    </div>
  );
}
