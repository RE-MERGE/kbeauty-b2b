import { useState } from "react";
import { Link } from "react-router";
import {
  Package, FileText, Send, Clock, CheckCircle, DollarSign, Plus,
  TrendingUp, Eye, ChevronRight, AlertCircle, Star, ShoppingBag,
} from "lucide-react";

type Tab = "overview" | "sourcing" | "quotes" | "products" | "orders";

const receivedSourcingRequests = [
  {
    id: "SRC-2024-0118",
    date: "2024.03.18",
    buyer: "KBeauty USA Inc",
    product: "시트 마스크 (콜라겐/히알루론산)",
    quantity: "10,000개",
    budget: "$25,000",
    deadline: "2024.04.30",
    status: "진행중" as const,
    quoteSent: true,
    myQuote: {
      id: "QUO-2024-0048",
      unitPrice: "$2.3",
      total: "$23,000",
      sentAt: "2024.03.19",
      status: "검토중",
    },
  },
  {
    id: "SRC-2024-0112",
    date: "2024.03.15",
    buyer: "뷰티월드",
    product: "쿠션 파운데이션 5종 (색상별)",
    quantity: "2,500개",
    budget: "$30,000~$40,000",
    deadline: "2024.04.15",
    status: "신규" as const,
    quoteSent: false,
  },
];

const myProducts = [
  { id: 1, name: "콜라겐 시트 마스크 25mL", category: "마스크팩", price: "$2.3", moq: "5,000개", stock: "재고 있음", status: "판매중", orders: 42 },
  { id: 2, name: "히알루론산 슬리핑 마스크 100mL", category: "마스크팩", price: "$4.0", moq: "2,000개", stock: "재고 있음", status: "판매중", orders: 28 },
  { id: 3, name: "비타민C 브라이트닝 세럼 30mL", category: "스킨케어", price: "$8.5", moq: "1,000개", stock: "소진 임박", status: "판매중", orders: 15 },
];

const recentOrders = [
  { id: "TKR-2024-0841", date: "2024.03.18", buyer: "글로벌뷰티㈜", product: "히알루론산 에센스", quantity: "1,000개", status: "배송 중", amount: "$12,000" },
  { id: "TKR-2024-0820", date: "2024.03.10", buyer: "KBeauty USA Inc", product: "콜라겐 시트 마스크", quantity: "5,000개", status: "결제 완료", amount: "$11,500" },
];

export function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);

  const tabs = [
    { id: "overview" as Tab, label: "대시보드 홈", icon: <TrendingUp size={16} /> },
    { id: "sourcing" as Tab, label: "소싱 요청 수신", icon: <FileText size={16} /> },
    { id: "quotes" as Tab, label: "내 견적서 현황", icon: <Send size={16} /> },
    { id: "products" as Tab, label: "제품 관리", icon: <Package size={16} /> },
    { id: "orders" as Tab, label: "주문 현황", icon: <ShoppingBag size={16} /> },
  ];

  const newRequests = receivedSourcingRequests.filter(r => !r.quoteSent);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2e1a] to-[#2d4a35] text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Star size={26} />
              <h1 className="text-2xl font-bold">셀러 전용 페이지</h1>
              <span className="bg-white/20 text-white text-xs px-2.5 py-0.5 rounded-full">SELLER</span>
            </div>
            <p className="text-white/80 text-sm mt-1">안녕하세요, 메디힐㈜ 님. 소싱 요청 및 제품 관리를 진행하세요.</p>
          </div>
          <Link
            to="/seller/products/new"
            className="bg-white text-[#2d4a35] hover:bg-white/90 px-5 py-2.5 rounded font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> 새 제품 등록
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
                  ? "bg-[#2d4a35] text-white"
                  : "bg-white border border-border text-foreground hover:border-[#2d4a35] hover:text-[#2d4a35]"
              }`}
            >
              {tab.icon}
              <span className="text-sm font-medium">{tab.label}</span>
              {tab.id === "sourcing" && newRequests.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                  {newRequests.length}
                </span>
              )}
            </button>
          ))}

          <div className="pt-3 border-t border-border">
            <Link to="/seller/products/new" className="w-full bg-[#2d4a35] hover:bg-[#1a2e1a] text-white py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-2">
              <Plus size={14} /> 제품 등록
            </Link>
          </div>
          <Link to="/mypage" className="w-full border border-border text-muted-foreground hover:border-primary hover:text-primary py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center">
            마이페이지
          </Link>
        </div>

        {/* Content */}
        <div>
          {/* Overview */}
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-orange-50 p-2 rounded"><FileText size={18} className="text-orange-600" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground">새 소싱 요청</div>
                      <div className="text-2xl font-bold text-foreground font-mono">{newRequests.length}</div>
                    </div>
                  </div>
                  <div className="text-xs text-orange-600">견적서 발송 필요</div>
                </div>
                <div className="bg-white border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-green-50 p-2 rounded"><Send size={18} className="text-green-600" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground">발송 견적서</div>
                      <div className="text-2xl font-bold text-foreground font-mono">{receivedSourcingRequests.filter(r => r.quoteSent).length}</div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">검토 중</div>
                </div>
                <div className="bg-white border border-border rounded-lg p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-primary/10 p-2 rounded"><DollarSign size={18} className="text-primary" /></div>
                    <div>
                      <div className="text-xs text-muted-foreground">이번달 매출</div>
                      <div className="text-2xl font-bold text-foreground font-mono">$23.5K</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600"><TrendingUp size={11} />+8%</div>
                </div>
              </div>

              {/* 새 요청 알림 */}
              {newRequests.length > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle size={16} className="text-orange-600" />
                    <span className="font-semibold text-orange-800 text-sm">새로운 소싱 요청 {newRequests.length}건 — 견적서를 발송해 주세요</span>
                  </div>
                  {newRequests.map((r) => (
                    <div key={r.id} className="flex items-center justify-between bg-white border border-orange-200 rounded p-3">
                      <div>
                        <div className="text-sm font-medium text-foreground">{r.product}</div>
                        <div className="text-xs text-muted-foreground">{r.id} · {r.buyer} · {r.quantity}</div>
                      </div>
                      <button
                        onClick={() => { setActiveTab("sourcing"); setExpandedSrc(r.id); }}
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs px-3 py-1.5 rounded font-semibold transition-colors"
                      >
                        견적서 발송
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 등록 제품 */}
              <div className="bg-white border border-border rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-bold text-foreground flex items-center gap-2"><Package size={16} className="text-primary" />등록 제품</h3>
                  <Link to="/seller/products/new" className="text-xs text-primary hover:underline">+ 새 제품 등록</Link>
                </div>
                <div className="divide-y divide-border">
                  {myProducts.map((p) => (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.category} · MOQ {p.moq}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded border ${p.stock === "소진 임박" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700"}`}>
                        {p.stock}
                      </span>
                      <span className="font-mono font-bold text-primary text-sm">{p.price}</span>
                      <span className="text-xs text-muted-foreground">주문 {p.orders}건</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Sourcing Requests */}
          {activeTab === "sourcing" && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2"><FileText size={18} className="text-primary" />받은 소싱 요청</h2>
              </div>
              <div className="divide-y divide-border">
                {receivedSourcingRequests.map((req) => {
                  const isExpanded = expandedSrc === req.id;
                  return (
                    <div key={req.id}>
                      <div
                        className="px-5 py-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedSrc(isExpanded ? null : req.id)}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-sm text-foreground">{req.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            req.quoteSent ? "bg-green-50 border-green-200 text-green-700" : "bg-orange-50 border-orange-200 text-orange-700"
                          }`}>
                            {req.quoteSent ? <><Send size={10} />견적발송</> : <><AlertCircle size={10} />견적 미발송</>}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">{req.product}</div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>바이어: {req.buyer}</span>
                          <span>수량: {req.quantity}</span>
                          <span>예산: {req.budget}</span>
                          <span>납기: {req.deadline}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="px-5 pb-4 bg-muted/20 border-t border-border">
                          {req.quoteSent && req.myQuote ? (
                            <div className="mt-3 bg-green-50 border border-green-200 rounded p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Send size={14} className="text-green-600" />
                                <h4 className="font-semibold text-foreground text-sm">내가 발송한 견적서</h4>
                                <span className="font-mono text-xs text-muted-foreground">{req.myQuote.id}</span>
                                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">{req.myQuote.status}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-4">
                                <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{req.myQuote.unitPrice}</div></div>
                                <div><div className="text-xs text-muted-foreground">총액</div><div className="font-bold text-foreground">{req.myQuote.total}</div></div>
                                <div><div className="text-xs text-muted-foreground">발송일</div><div className="font-medium text-foreground">{req.myQuote.sentAt}</div></div>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3">
                              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-3 text-sm text-amber-800 flex items-start gap-2">
                                <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
                                아직 견적서를 발송하지 않았습니다. 빠른 답변이 수주 가능성을 높입니다.
                              </div>
                              <div className="grid grid-cols-2 gap-3 mb-3">
                                <div>
                                  <label className="text-xs font-medium text-foreground mb-1 block">단가 (USD)</label>
                                  <input type="text" placeholder="예: $2.5" className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-foreground mb-1 block">납기 (일)</label>
                                  <input type="text" placeholder="예: 21일" className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                                </div>
                              </div>
                              <textarea rows={3} placeholder="견적 조건, 패키징, 인증 등 추가 사항 기재" className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary resize-none mb-3" />
                              <button className="bg-[#2d4a35] hover:bg-[#1a2e1a] text-white text-sm px-6 py-2.5 rounded font-semibold transition-colors flex items-center gap-2">
                                <Send size={14} /> 견적서 발송
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* My Quotes */}
          {activeTab === "quotes" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Send size={20} className="text-primary" /> 발송한 견적서 현황
              </h2>
              {receivedSourcingRequests.filter(r => r.quoteSent && r.myQuote).map((r) => (
                <div key={r.id} className="bg-white border border-border rounded-lg overflow-hidden">
                  <div className="px-5 py-4 bg-muted/30 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-sm">{r.myQuote!.id}</span>
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            r.myQuote!.status === "검토중" ? "bg-blue-50 border-blue-200 text-blue-700" :
                            r.myQuote!.status === "수락" ? "bg-green-50 border-green-200 text-green-700" :
                            "bg-muted border-border text-muted-foreground"
                          }`}>{r.myQuote!.status}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">소싱 요청: {r.id} · 바이어: {r.buyer}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">발송일: {r.myQuote!.sentAt}</div>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="text-sm font-medium text-foreground mb-3">{r.product}</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{r.myQuote!.unitPrice}</div></div>
                      <div><div className="text-xs text-muted-foreground">총액</div><div className="font-bold text-foreground">{r.myQuote!.total}</div></div>
                      <div><div className="text-xs text-muted-foreground">요청 수량</div><div className="font-medium text-foreground">{r.quantity}</div></div>
                    </div>
                  </div>
                </div>
              ))}
              {receivedSourcingRequests.filter(r => r.quoteSent).length === 0 && (
                <div className="bg-white border border-border rounded-lg p-12 text-center text-muted-foreground">
                  <Send size={36} className="mx-auto mb-3 opacity-30" />
                  <div>아직 발송한 견적서가 없습니다.</div>
                </div>
              )}
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground flex items-center gap-2"><Package size={18} className="text-primary" />등록 제품 목록</h2>
                <Link to="/seller/products/new" className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors flex items-center gap-1.5">
                  <Plus size={12} /> 새 제품 등록
                </Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                    <th className="px-5 py-3 text-left font-medium">제품명</th>
                    <th className="px-3 py-3 text-left font-medium">카테고리</th>
                    <th className="px-3 py-3 text-right font-medium">단가</th>
                    <th className="px-3 py-3 text-center font-medium">MOQ</th>
                    <th className="px-3 py-3 text-center font-medium">재고</th>
                    <th className="px-3 py-3 text-right font-medium">주문수</th>
                    <th className="px-3 py-3 text-center font-medium">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {myProducts.map((p) => (
                    <tr key={p.id} className="border-t border-border hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3 font-medium text-foreground">{p.name}</td>
                      <td className="px-3 py-3"><span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{p.category}</span></td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-primary">{p.price}</td>
                      <td className="px-3 py-3 text-center text-muted-foreground text-xs">{p.moq}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-[11px] px-2 py-0.5 rounded border ${
                          p.stock === "소진 임박" ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700"
                        }`}>{p.stock}</span>
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-muted-foreground">{p.orders}</td>
                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button className="text-xs text-primary hover:underline">수정</button>
                          <span className="text-border">|</span>
                          <button className="text-xs text-muted-foreground hover:text-foreground">삭제</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="font-bold text-foreground flex items-center gap-2"><ShoppingBag size={18} className="text-primary" />주문 현황</h2>
              </div>
              <div className="divide-y divide-border">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground mb-1">{o.product}</div>
                      <div className="text-xs text-muted-foreground font-mono">{o.id} · {o.date} · {o.buyer}</div>
                    </div>
                    <span className="text-xs text-muted-foreground">{o.quantity}</span>
                    <span className="text-xs bg-secondary text-primary border border-primary/20 px-2 py-0.5 rounded">{o.status}</span>
                    <span className="font-mono font-bold text-foreground">{o.amount}</span>
                    <Link to={`/orders/${o.id}`} className="border border-border text-foreground hover:border-primary hover:text-primary text-xs px-3 py-1.5 rounded transition-colors flex items-center gap-1">
                      <Eye size={12} /> 상세
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
