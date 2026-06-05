import { useState } from "react";
import { Link } from "react-router";
import {
  ShoppingBag, FileText, Send, Clock, CheckCircle, Package, Eye, ChevronRight,
  TrendingUp, DollarSign, AlertCircle, MessageSquare, Bell,
} from "lucide-react";

type Tab = "overview" | "sourcing" | "quotes" | "orders";

const sourcingRequests = [
  {
    id: "SRC-2024-0124",
    date: "2024.03.21",
    product: "비타민C 세럼 30mL OEM",
    quantity: "2,000개",
    budget: "$15,000~$20,000",
    status: "신규" as const,
    quoteReceived: false,
  },
  {
    id: "SRC-2024-0118",
    date: "2024.03.18",
    product: "시트 마스크 (콜라겐/히알루론산)",
    quantity: "10,000개",
    budget: "$25,000",
    status: "견적발송" as const,
    quoteReceived: true,
    quote: {
      id: "QUO-2024-0048",
      supplier: "메디힐㈜",
      unitPrice: "$2.3",
      total: "$23,000",
      validUntil: "2024.04.10",
      notes: "FDA 등록 완료, 납기 3주 소요",
    },
  },
  {
    id: "SRC-2024-0112",
    date: "2024.03.15",
    product: "쿠션 파운데이션 5종 (색상별)",
    quantity: "2,500개",
    budget: "$30,000~$40,000",
    status: "검토중" as const,
    quoteReceived: false,
  },
];

const recentOrders = [
  { id: "TKR-2024-0841", date: "2024.03.18", product: "히알루론산 에센스 50mL", status: "배송 중", total: "$12,000" },
  { id: "TKR-2024-0820", date: "2024.03.10", product: "콜라겐 시트 마스크", status: "결제 완료", total: "$20,500" },
  { id: "TKR-2024-0807", date: "2024.02.28", product: "쿠션 파운데이션", status: "주문 확인", total: "$7,500" },
];

const statusConfig = {
  신규: { bg: "bg-blue-50 border-blue-200", color: "text-blue-700", icon: <Clock size={11} /> },
  검토중: { bg: "bg-purple-50 border-purple-200", color: "text-purple-700", icon: <AlertCircle size={11} /> },
  견적발송: { bg: "bg-green-50 border-green-200", color: "text-green-700", icon: <Send size={11} /> },
  완료: { bg: "bg-muted border-border", color: "text-muted-foreground", icon: <CheckCircle size={11} /> },
  취소: { bg: "bg-red-50 border-red-200", color: "text-red-700", icon: <AlertCircle size={11} /> },
};

export function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);

  const tabs = [
    { id: "overview" as Tab, label: "대시보드 홈", icon: <TrendingUp size={16} /> },
    { id: "sourcing" as Tab, label: "소싱 요청 내역", icon: <FileText size={16} /> },
    { id: "quotes" as Tab, label: "받은 견적서", icon: <Send size={16} /> },
    { id: "orders" as Tab, label: "주문 내역", icon: <ShoppingBag size={16} /> },
  ];

  const receivedQuotes = sourcingRequests.filter((s) => s.quoteReceived && s.quote);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <ShoppingBag size={26} />
              <h1 className="text-2xl font-bold">바이어 전용 페이지</h1>
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">BUYER</span>
            </div>
            <p className="text-white/80 text-sm mt-1">안녕하세요, 글로벌뷰티㈜ 님. 소싱 요청 및 주문 현황을 확인하세요.</p>
          </div>
          <Link
            to="/quote-request"
            className="bg-white text-primary hover:bg-white/90 px-5 py-2.5 rounded font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <FileText size={16} /> 새 소싱 요청
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-1.5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors text-left ${
                activeTab === tab.id
                  ? "bg-primary text-white"
                  : "bg-white border border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.id === "quotes" && receivedQuotes.length > 0 && (
                <span className="ml-auto bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {receivedQuotes.length}
                </span>
              )}
            </button>
          ))}

          <div className="pt-3 border-t border-border">
            <Link to="/quote-request" className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <FileText size={14} /> 소싱 요청서 작성
            </Link>
          </div>
          <Link to="/mypage" className="w-full border border-border text-muted-foreground hover:border-primary hover:text-primary py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
            마이페이지
          </Link>
        </div>

        {/* Content */}
        <div>
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-blue-50 p-2 rounded"><FileText size={18} className="text-blue-600" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground">소싱 요청</div>
                      <div className="text-2xl font-bold text-foreground font-mono">{sourcingRequests.length}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">진행중 {sourcingRequests.filter(s => s.status !== "완료" && s.status !== "취소").length}건</div>
                </div>
                <div className="bg-white border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-50 p-2 rounded"><Send size={18} className="text-green-600" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground">받은 견적서</div>
                      <div className="text-2xl font-bold text-foreground font-mono">{receivedQuotes.length}</div>
                    </div>
                  </div>
                  <div className="text-xs text-green-600">확인 필요</div>
                </div>
                <div className="bg-white border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded"><DollarSign size={18} className="text-primary" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground">이번달 주문액</div>
                      <div className="text-2xl font-bold text-foreground font-mono">$40K</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600"><TrendingUp size={11} />+12%</div>
                </div>
              </div>

              {/* 견적서 알림 */}
              {receivedQuotes.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell size={16} className="text-green-600" />
                    <span className="font-semibold text-green-800 text-sm">새로운 견적서 {receivedQuotes.length}건이 도착했습니다</span>
                  </div>
                  {receivedQuotes.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white border border-green-200 rounded p-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{s.product}</div>
                        <div className="text-xs text-muted-foreground">{s.id} · {s.quote?.supplier}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary">{s.quote?.total}</div>
                          <div className="text-xs text-muted-foreground">단가 {s.quote?.unitPrice}</div>
                        </div>
                        <button
                          onClick={() => setActiveTab("quotes")}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded font-semibold transition-colors"
                        >
                          견적서 확인
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 최근 주문 */}
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2"><Package size={16} className="text-primary" />최근 주문</h3>
                  <Link to="/orders" className="text-xs text-primary hover:underline">전체보기</Link>
                </div>
                <div className="divide-y divide-border">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{o.product}</div>
                        <div className="text-xs text-muted-foreground font-mono">{o.id} · {o.date}</div>
                      </div>
                      <span className="text-xs bg-secondary text-primary border border-primary/20 px-2 py-0.5 rounded">{o.status}</span>
                      <span className="font-mono font-bold text-sm text-foreground">{o.total}</span>
                      <Link to={`/orders/${o.id}`} className="text-xs text-primary hover:underline flex items-center gap-0.5">
                        상세 <ChevronRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sourcing Requests */}
          {activeTab === "sourcing" && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground flex items-center gap-2"><FileText size={18} className="text-primary" />소싱 요청 내역</h2>
                <Link to="/quote-request" className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors flex items-center gap-1.5">
                  <FileText size={12} /> 새 요청
                </Link>
              </div>
              <div className="divide-y divide-border">
                {sourcingRequests.map((req) => {
                  const st = statusConfig[req.status];
                  const isExpanded = expandedSrc === req.id;
                  return (
                    <div key={req.id}>
                      <div
                        className="px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedSrc(isExpanded ? null : req.id)}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-sm text-foreground">{req.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${st.bg} ${st.color}`}>
                            {st.icon}{req.status}
                          </span>
                          {req.quoteReceived && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border bg-green-50 border-green-200 text-green-700">
                              <Send size={10} />견적서 수신
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">{req.product}</div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{req.date}</span>
                          <span>수량: {req.quantity}</span>
                          <span>예산: {req.budget}</span>
                        </div>
                      </div>
                      {isExpanded && req.quoteReceived && req.quote && (
                        <div className="px-5 pb-4 bg-green-50 border-t border-green-200">
                          <div className="bg-white border border-green-200 rounded p-4 mt-3">
                            <div className="flex items-center gap-2 mb-3">
                              <Send size={14} className="text-green-600" />
                              <h4 className="font-semibold text-foreground text-sm">받은 견적서</h4>
                              <span className="font-mono text-xs text-muted-foreground">{req.quote.id}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-3">
                              <div>
                                <div className="text-xs text-muted-foreground">공급업체</div>
                                <div className="text-sm font-medium text-foreground">{req.quote.supplier}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">단가</div>
                                <div className="text-sm font-bold text-primary">{req.quote.unitPrice}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">총액</div>
                                <div className="text-sm font-bold text-foreground">{req.quote.total}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2">{req.quote.notes}</div>
                            <div className="flex gap-2 mt-3">
                              <button className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors">
                                견적 수락 → 주문
                              </button>
                              <button className="border border-border text-muted-foreground hover:border-primary hover:text-primary text-xs px-4 py-2 rounded transition-colors">
                                재협의 요청
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      {isExpanded && !req.quoteReceived && (
                        <div className="px-5 pb-4 bg-muted/20 border-t border-border">
                          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            담당 매니저가 공급업체를 검토 중입니다. 견적서 도착 시 알림을 보내드립니다.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quotes */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Send size={20} className="text-primary" /> 받은 견적서
                </h2>
              </div>
              {receivedQuotes.length === 0 ? (
                <div className="bg-white border border-border rounded-lg p-12 text-center text-muted-foreground">
                  <Send size={36} className="mx-auto mb-3 opacity-30" />
                  <div className="font-medium">아직 받은 견적서가 없습니다</div>
                  <div className="text-sm mt-1">소싱 요청서를 제출하면 매니저가 견적서를 발송해드립니다.</div>
                  <Link to="/quote-request" className="mt-4 inline-block bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors">
                    소싱 요청하기
                  </Link>
                </div>
              ) : (
                receivedQuotes.map((s) => s.quote && (
                  <div key={s.id} className="bg-white border border-border rounded-lg overflow-hidden hover:border-primary transition-colors">
                    <div className="px-5 py-4 bg-green-50 border-b border-green-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold text-sm">{s.quote.id}</span>
                            <span className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded border border-green-200 font-semibold">견적서 수신</span>
                          </div>
                          <div className="text-xs text-muted-foreground">소싱 요청: {s.id} · {s.product}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">유효기한</div>
                          <div className="text-sm font-semibold text-foreground">{s.quote.validUntil}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">공급업체</div>
                          <div className="text-sm font-semibold text-foreground">{s.quote.supplier}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">요청 수량</div>
                          <div className="text-sm font-semibold text-foreground">{s.quantity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">단가</div>
                          <div className="text-sm font-bold text-primary">{s.quote.unitPrice}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">총 견적액</div>
                          <div className="text-sm font-bold text-foreground">{s.quote.total}</div>
                        </div>
                      </div>
                      <div className="bg-muted/30 border border-border rounded p-3 mb-4 text-sm text-foreground leading-relaxed">
                        <div className="text-xs font-semibold text-muted-foreground mb-1">비고</div>
                        {s.quote.notes}
                      </div>
                      <div className="flex gap-3">
                        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors flex items-center gap-2">
                          <CheckCircle size={14} /> 견적 수락 → 주문 진행
                        </button>
                        <button className="border border-border text-foreground hover:border-primary hover:text-primary px-5 py-2.5 rounded text-sm font-medium transition-colors flex items-center gap-2">
                          <MessageSquare size={14} /> 재협의 요청
                        </button>
                        <button className="border border-border text-muted-foreground hover:border-primary hover:text-primary px-4 py-2.5 rounded text-sm transition-colors ml-auto flex items-center gap-1.5">
                          <Eye size={13} /> 견적서 전문 보기
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground flex items-center gap-2"><ShoppingBag size={18} className="text-primary" />주문 내역</h2>
                <Link to="/orders" className="text-xs text-primary hover:underline">전체 주문 관리 →</Link>
              </div>
              <div className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground mb-1">{o.product}</div>
                      <div className="text-xs text-muted-foreground font-mono">{o.id} · {o.date}</div>
                    </div>
                    <span className="text-xs bg-secondary text-primary border border-primary/20 px-2 py-0.5 rounded">{o.status}</span>
                    <span className="font-mono font-bold text-foreground">{o.total}</span>
                    <Link to={`/orders/${o.id}`} className="border border-border text-foreground hover:border-primary hover:text-primary text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                      <Eye size={12} /> 상세보기
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
