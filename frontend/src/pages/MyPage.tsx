import { useState } from "react";
import { Link } from "react-router";
import {
  User, ShoppingBag, MessageSquare, MapPin, Settings, AlertTriangle,
  ChevronRight, Package, FileText, Send, Clock, CheckCircle, Star, Eye, Truck,
  Copy, X, Plane, Ship, Weight, Ruler, RefreshCw, XCircle, CreditCard,
  Download, Printer, FileCheck, AlertCircle, Filter, Search, Calendar,
} from "lucide-react";

type UserRole = "buyer" | "seller";
type Tab = "orders" | "sourcing" | "quotes" | "shipping" | "inquiry" | "profile" | "address" | "shipping-quotes";

const myOrders = [
  { id: "TKR-2024-0841", date: "2024.03.18", status: "배송 중", items: 1, total: 12000 },
  { id: "TKR-2024-0820", date: "2024.03.10", status: "결제 완료", items: 2, total: 20500 },
  { id: "TKR-2024-0807", date: "2024.02.28", status: "주문 확인", items: 1, total: 7500 },
];

// 결제 완료된 주문 (배송 대기 중)
const shippingOrders = [
  {
    id: "ORD-2024-KR-0524",
    date: "2024.03.21",
    buyer: "글로벌뷰티㈜",
    seller: "코스메틱랩",
    product: "비타민C 세럼 30mL",
    quantity: "2,000개",
    total: 23000,
    destination: "미국, 뉴욕",
    hasQuote: false,
  },
  {
    id: "ORD-2024-KR-0518",
    date: "2024.03.18",
    buyer: "KBeauty USA Inc",
    seller: "뷰티팩토리",
    product: "시트 마스크 세트",
    quantity: "10,000개",
    total: 25000,
    destination: "캐나다, 토론토",
    hasQuote: true,
  },
  {
    id: "ORD-2024-KR-0501",
    date: "2024.03.15",
    buyer: "뷰티월드",
    seller: "메이크업프로",
    product: "쿠션 파운데이션",
    quantity: "2,500개",
    total: 35000,
    destination: "일본, 도쿄",
    hasQuote: false,
  },
];

const myInquiries = [
  { id: 1, date: "2024.03.20", title: "배송 일정 문의", status: "답변완료", reply: "3월 23일 도착 예정입니다." },
  { id: 2, date: "2024.03.15", title: "견적서 관련 문의", status: "답변완료", reply: "견적서가 발송되었습니다." },
  { id: 3, date: "2024.03.10", title: "제품 상세 스펙 요청", status: "대기중", reply: null },
];

const myAddresses = [
  { id: 1, name: "회사 (기본)", recipient: "홍길동", phone: "010-1234-5678", address: "서울특별시 강남구 테헤란로 123", detail: "A동 5층", isDefault: true },
  { id: 2, name: "창고", recipient: "김철수", phone: "010-9876-5432", address: "인천광역시 중구 공항로 456", detail: "물류센터 B동", isDefault: false },
];

// 바이어 소싱 요청 내역
const buyerSourcingRequests = [
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

// 셀러 수신 소싱 요청 + 내 견적서
const sellerSourcingRequests = [
  {
    id: "SRC-2024-0118",
    date: "2024.03.18",
    buyer: "KBeauty USA Inc",
    product: "시트 마스크 (콜라겐/히알루론산)",
    quantity: "10,000개",
    budget: "$25,000",
    status: "진행중",
    quoteSent: true,
    myQuote: { id: "QUO-2024-0048", unitPrice: "$2.3", total: "$23,000", sentAt: "2024.03.19", status: "검토중" },
  },
  {
    id: "SRC-2024-0112",
    date: "2024.03.15",
    buyer: "뷰티월드",
    product: "쿠션 파운데이션 5종 (색상별)",
    quantity: "2,500개",
    budget: "$30,000~$40,000",
    status: "신규",
    quoteSent: false,
    myQuote: null,
  },
];

const statusStyle: Record<string, string> = {
  "신규": "bg-blue-50 border-blue-200 text-blue-700",
  "검토중": "bg-purple-50 border-purple-200 text-purple-700",
  "견적발송": "bg-green-50 border-green-200 text-green-700",
  "완료": "bg-muted border-border text-muted-foreground",
  "취소": "bg-red-50 border-red-200 text-red-700",
  "진행중": "bg-blue-50 border-blue-200 text-blue-700",
};

const buyerShippingQuotesList = [
  {
    id: "SHQ-2024-0524",
    orderId: "ORD-2024-KR-0524",
    quoteNumber: "QT-20240322-001",
    issueDate: "2024.03.22",
    validUntil: "2024.04.22",
    seller: "코스메틱랩",
    product: "비타민C 세럼 30mL",
    quantity: "2,000개",
    destination: "미국, 뉴욕",
    receivedAt: "2024.03.22",
    status: "검토중" as const,
    warehouseCode: "WH-KR-001",
    actualWeight: "45.5",
    boxDimensions: { width: "60", height: "40", depth: "35" },
    volumeWeight: "16.8",
    incoterms: "FOB",
    origin: "인천항 (ICN)",
    remarks: "화장품 FDA 등록 완료, HS Code 3304.99 적용",
    options: [
      {
        type: "항공 배송",
        method: "Air Freight",
        time: "3–5일",
        carrier: "Korean Air Cargo",
        freightCost: 2100,
        customsCost: 180,
        insurance: 80,
        handling: 40,
        total: 2400,
        icon: "air",
        incoterms: "CIF",
      },
      {
        type: "해상 배송 (LCL)",
        method: "Sea Freight LCL",
        time: "18–25일",
        carrier: "Maersk Line",
        freightCost: 620,
        customsCost: 120,
        insurance: 50,
        handling: 30,
        total: 820,
        icon: "sea",
        incoterms: "FOB",
      },
      {
        type: "특송 (DHL)",
        method: "Express Courier",
        time: "2–3일",
        carrier: "DHL Express",
        freightCost: 3400,
        customsCost: 250,
        insurance: 100,
        handling: 50,
        total: 3800,
        icon: "express",
        incoterms: "DDP",
      },
    ],
  },
  {
    id: "SHQ-2024-0518",
    orderId: "ORD-2024-KR-0518",
    quoteNumber: "QT-20240320-002",
    issueDate: "2024.03.20",
    validUntil: "2024.04.20",
    seller: "뷰티팩토리",
    product: "시트 마스크 세트",
    quantity: "10,000개",
    destination: "캐나다, 토론토",
    receivedAt: "2024.03.20",
    status: "승인완료" as const,
    warehouseCode: "WH-KR-002",
    actualWeight: "125.0",
    boxDimensions: { width: "80", height: "60", depth: "50" },
    volumeWeight: "48.0",
    selectedOption: 1,
    confirmedAt: "2024.03.21",
    incoterms: "FOB",
    origin: "부산항 (PUS)",
    remarks: "컨테이너 혼적 가능, 온도 관리 필요 없음",
    options: [
      {
        type: "항공 배송",
        method: "Air Freight",
        time: "3–5일",
        carrier: "Asiana Cargo",
        freightCost: 7200,
        customsCost: 600,
        insurance: 300,
        handling: 100,
        total: 8200,
        icon: "air",
        incoterms: "CIF",
      },
      {
        type: "해상 배송 (FCL)",
        method: "Sea Freight FCL 20ft",
        time: "20–28일",
        carrier: "HMM",
        freightCost: 1600,
        customsCost: 280,
        insurance: 150,
        handling: 70,
        total: 2100,
        icon: "sea",
        incoterms: "FOB",
      },
      {
        type: "특송 (FedEx)",
        method: "Express Courier",
        time: "2–3일",
        carrier: "FedEx International",
        freightCost: 10800,
        customsCost: 800,
        insurance: 300,
        handling: 100,
        total: 12000,
        icon: "express",
        incoterms: "DDP",
      },
    ],
  },
];

export function MyPage() {
  const [role, setRole] = useState<UserRole>("buyer");
  const [activeTab, setActiveTab] = useState<Tab>("orders");
  const [inquiryText, setInquiryText] = useState("");
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [expandedSrc, setExpandedSrc] = useState<string | null>(null);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [selectedShippingOption, setSelectedShippingOption] = useState<Record<string, number>>({});
  const [confirmedShippingQuotes, setConfirmedShippingQuotes] = useState<Set<string>>(new Set());
  const [showRejectConfirm, setShowRejectConfirm] = useState<string | null>(null);
  const [expandedQuote, setExpandedQuote] = useState<string | null>(null);
  const [selectedQuotesForCompare, setSelectedQuotesForCompare] = useState<Set<string>>(new Set());
  const [quoteFilter, setQuoteFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const myDeliveryAddress = {
    recipient: "TradeKR 인천물류창고",
    address: "인천광역시 중구 공항로 123",
    detail: "TradeKR 3동 B-구역",
    code: "TKR-KR-20941",
    phone: "032-000-0000",
    zipcode: "22382",
  };
  const fullAddressText = `[수령인] ${myDeliveryAddress.recipient}\n[주소] ${myDeliveryAddress.address} ${myDeliveryAddress.detail}\n[우편번호] ${myDeliveryAddress.zipcode}\n[관리코드] ${myDeliveryAddress.code}\n[연락처] ${myDeliveryAddress.phone}`;
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddressText).then(() => {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2500);
    });
  };

  const buyerTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "주문 내역", icon: <ShoppingBag size={18} /> },
    { id: "sourcing", label: "소싱 요청 내역", icon: <FileText size={18} /> },
    { id: "quotes", label: "받은 견적서", icon: <Send size={18} /> },
    { id: "shipping", label: "배송 관리", icon: <Truck size={18} /> },
    { id: "shipping-quotes", label: "배송 견적서", icon: <Plane size={18} /> },
    { id: "inquiry", label: "MY 활동", icon: <MessageSquare size={18} /> },
    { id: "profile", label: "MY 정보", icon: <Settings size={18} /> },
    { id: "address", label: "배송지·주소 발급", icon: <MapPin size={18} /> },
  ];

  const sellerTabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "orders", label: "주문 현황", icon: <ShoppingBag size={18} /> },
    { id: "sourcing", label: "소싱 요청 수신", icon: <FileText size={18} /> },
    { id: "quotes", label: "내 견적서", icon: <Send size={18} /> },
    { id: "shipping", label: "배송 관리", icon: <Truck size={18} /> },
    { id: "inquiry", label: "MY 활동", icon: <MessageSquare size={18} /> },
    { id: "profile", label: "MY 정보", icon: <Settings size={18} /> },
    { id: "address", label: "배송지 관리", icon: <MapPin size={18} /> },
  ];

  const tabs = role === "buyer" ? buyerTabs : sellerTabs;

  const receivedQuotes = buyerSourcingRequests.filter(s => s.quoteReceived && s.quote);

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <User size={24} className="text-primary" /> 마이페이지
      </h1>

      {/* Role Switch */}
      <div className="flex items-center gap-2 mb-6 bg-white border border-border rounded-lg p-2 w-fit">
        <button
          onClick={() => { setRole("buyer"); setActiveTab("orders"); }}
          className={`px-5 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2 ${role === "buyer" ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          <ShoppingBag size={15} /> 바이어
        </button>
        <button
          onClick={() => { setRole("seller"); setActiveTab("orders"); }}
          className={`px-5 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2 ${role === "seller" ? "bg-[#2d4a35] text-white" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Star size={15} /> 셀러
        </button>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                activeTab === tab.id
                  ? role === "buyer" ? "bg-primary text-white" : "bg-[#2d4a35] text-white"
                  : "bg-white border border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
              {tab.id === "quotes" && role === "buyer" && receivedQuotes.length > 0 && (
                <span className="ml-auto bg-green-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{receivedQuotes.length}</span>
              )}
              {tab.id === "shipping-quotes" && role === "buyer" && (
                <span className="ml-auto bg-blue-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{buyerShippingQuotesList.filter(q => q.status !== "선택 완료").length}</span>
              )}
              {tab.id === "sourcing" && role === "seller" && sellerSourcingRequests.filter(r => !r.quoteSent).length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{sellerSourcingRequests.filter(r => !r.quoteSent).length}</span>
              )}
            </button>
          ))}

          <div className="pt-2 border-t border-border">
            {role === "buyer" ? (
              <Link to="/buyer" className="w-full bg-secondary border border-primary/20 text-primary hover:bg-primary hover:text-white py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
                바이어 전용 페이지 →
              </Link>
            ) : (
              <Link to="/seller" className="w-full bg-[#f0f4f0] border border-[#2d4a35]/20 text-[#2d4a35] hover:bg-[#2d4a35] hover:text-white py-2.5 rounded text-sm font-semibold transition-colors flex items-center justify-center gap-1.5">
                셀러 전용 페이지 →
              </Link>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white border border-border rounded-lg p-6">
          {/* 주문 내역 */}
          {activeTab === "orders" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Package size={20} className="text-primary" />
                {role === "buyer" ? "주문 목록" : "주문 현황"}
              </h2>
              <div className="space-y-3">
                {myOrders.map((order) => (
                  <div key={order.id} className="border border-border rounded p-4 hover:border-primary transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">{order.id}</span>
                        <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded border border-primary/20">{order.status}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{order.items}개 품목</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-foreground">${order.total.toLocaleString()}</span>
                        <Link to={`/orders/${order.id}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                          상세보기 <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/orders" className="mt-4 w-full border border-border text-muted-foreground hover:border-primary hover:text-primary py-2.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
                전체 주문 내역 보기
              </Link>
            </div>
          )}

          {/* 소싱 요청 내역 (바이어) */}
          {activeTab === "sourcing" && role === "buyer" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <FileText size={20} className="text-primary" /> 소싱 요청 내역
                </h2>
                <Link to="/quote-request" className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors">
                  + 새 요청
                </Link>
              </div>
              <div className="space-y-3">
                {buyerSourcingRequests.map((req) => {
                  const isExpanded = expandedSrc === req.id;
                  return (
                    <div key={req.id} className="border border-border rounded overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedSrc(isExpanded ? null : req.id)}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-sm text-foreground">{req.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${statusStyle[req.status]}`}>
                            {req.status}
                          </span>
                          {req.quoteReceived && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border bg-green-50 border-green-200 text-green-700">
                              <Send size={9} />견적 수신
                            </span>
                          )}
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">{req.product}</div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>{req.date}</span>
                          <span>{req.quantity}</span>
                          <span>{req.budget}</span>
                        </div>
                      </div>
                      {isExpanded && req.quoteReceived && req.quote && (
                        <div className="bg-green-50 border-t border-green-200 p-4">
                          <div className="bg-white border border-green-200 rounded p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Send size={14} className="text-green-600" />
                              <h4 className="font-semibold text-sm">받은 견적서 — {req.quote.id}</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                              <div><div className="text-xs text-muted-foreground">공급업체</div><div className="font-medium">{req.quote.supplier}</div></div>
                              <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{req.quote.unitPrice}</div></div>
                              <div><div className="text-xs text-muted-foreground">총액</div><div className="font-bold">{req.quote.total}</div></div>
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mb-3">{req.quote.notes}</div>
                            <div className="flex gap-2">
                              <button className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors">
                                견적 수락 → 주문
                              </button>
                              <Link to="/buyer?tab=quotes" className="border border-border text-muted-foreground hover:border-primary hover:text-primary text-xs px-4 py-2 rounded transition-colors flex items-center gap-1">
                                <Eye size={11} /> 견적서 전문
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      {isExpanded && !req.quoteReceived && (
                        <div className="bg-muted/20 border-t border-border p-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={14} />
                            담당 매니저가 검토 중입니다. 견적서 도착 시 알림을 보내드립니다.
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 소싱 요청 수신 (셀러) */}
          {activeTab === "sourcing" && role === "seller" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <FileText size={20} className="text-primary" /> 받은 소싱 요청
              </h2>
              <div className="space-y-3">
                {sellerSourcingRequests.map((req) => {
                  const isExpanded = expandedSrc === req.id;
                  return (
                    <div key={req.id} className="border border-border rounded overflow-hidden">
                      <div
                        className="p-4 cursor-pointer hover:bg-muted/20 transition-colors"
                        onClick={() => setExpandedSrc(isExpanded ? null : req.id)}
                      >
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono font-bold text-sm text-foreground">{req.id}</span>
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded border ${
                            req.quoteSent ? "bg-green-50 border-green-200 text-green-700" : "bg-orange-50 border-orange-200 text-orange-700"
                          }`}>
                            {req.quoteSent ? <><CheckCircle size={9} />견적발송</> : <>견적 미발송</>}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-foreground mb-1">{req.product}</div>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>바이어: {req.buyer}</span>
                          <span>{req.quantity}</span>
                          <span>{req.budget}</span>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="bg-muted/20 border-t border-border p-4">
                          {req.quoteSent && req.myQuote ? (
                            <div className="bg-white border border-green-200 rounded p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Send size={13} className="text-green-600" />
                                <span className="font-semibold text-sm">내가 발송한 견적서 — {req.myQuote.id}</span>
                                <span className="text-[11px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">{req.myQuote.status}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-3 text-sm">
                                <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{req.myQuote.unitPrice}</div></div>
                                <div><div className="text-xs text-muted-foreground">총액</div><div className="font-bold">{req.myQuote.total}</div></div>
                                <div><div className="text-xs text-muted-foreground">발송일</div><div className="font-medium">{req.myQuote.sentAt}</div></div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              아직 견적서를 발송하지 않았습니다.
                              <Link to="/seller" className="text-primary hover:underline ml-1">셀러 페이지에서 발송하기 →</Link>
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

          {/* 받은 견적서 (바이어) */}
          {activeTab === "quotes" && role === "buyer" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Send size={20} className="text-primary" /> 받은 견적서
              </h2>
              {receivedQuotes.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <Send size={32} className="mx-auto mb-3 opacity-30" />
                  <div>아직 받은 견적서가 없습니다.</div>
                  <Link to="/quote-request" className="mt-3 inline-block text-primary hover:underline text-sm">소싱 요청하기 →</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedQuotes.filter((s) => s.quote).map((s) => (
                    <div key={s.id} className="border border-green-200 rounded-lg overflow-hidden">
                      <div className="px-5 py-3.5 bg-green-50 border-b border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-foreground">{s.quote.id}</span>
                            <span className="bg-green-100 text-green-700 text-[11px] px-2 py-0.5 rounded border border-green-200 font-semibold">견적서 수신</span>
                          </div>
                          <span className="text-xs text-muted-foreground">유효: {s.quote.validUntil}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">소싱요청: {s.id} · {s.product}</div>
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                          <div><div className="text-xs text-muted-foreground">공급업체</div><div className="font-semibold">{s.quote.supplier}</div></div>
                          <div><div className="text-xs text-muted-foreground">수량</div><div className="font-medium">{s.quantity}</div></div>
                          <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{s.quote.unitPrice}</div></div>
                          <div><div className="text-xs text-muted-foreground">총액</div><div className="font-bold">{s.quote.total}</div></div>
                        </div>
                        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 mb-3">{s.quote.notes}</div>
                        <div className="flex gap-2">
                          <button className="bg-primary hover:bg-primary/90 text-white text-xs px-4 py-2 rounded font-semibold transition-colors flex items-center gap-1.5">
                            <CheckCircle size={12} /> 수락 → 주문 진행
                          </button>
                          <button className="border border-border text-muted-foreground hover:border-primary hover:text-primary text-xs px-4 py-2 rounded transition-colors">
                            재협의 요청
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 내 견적서 (셀러) */}
          {activeTab === "quotes" && role === "seller" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Send size={20} className="text-primary" /> 발송한 견적서
              </h2>
              <div className="space-y-3">
                {sellerSourcingRequests.filter(r => r.quoteSent && r.myQuote).map((r) => (
                  <div key={r.id} className="border border-border rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono font-bold text-sm">{r.myQuote!.id}</span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                        r.myQuote!.status === "검토중" ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-muted border-border text-muted-foreground"
                      }`}>{r.myQuote!.status}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground mb-2">{r.product}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div><div className="text-xs text-muted-foreground">바이어</div><div className="font-medium">{r.buyer}</div></div>
                      <div><div className="text-xs text-muted-foreground">단가</div><div className="font-bold text-primary">{r.myQuote!.unitPrice}</div></div>
                      <div><div className="text-xs text-muted-foreground">총액</div><div className="font-bold">{r.myQuote!.total}</div></div>
                    </div>
                  </div>
                ))}
                {sellerSourcingRequests.filter(r => r.quoteSent).length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <Send size={32} className="mx-auto mb-3 opacity-30" />
                    발송한 견적서가 없습니다.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 배송 관리 (셀러) */}
          {activeTab === "shipping" && role === "seller" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Truck size={20} className="text-primary" /> 배송 관리
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                결제 완료된 주문의 배송 견적서를 작성하세요
              </p>
              <div className="space-y-3">
                {shippingOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/seller/shipping-quote?orderId=${order.id}`}
                    className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all block"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-foreground">{order.id}</span>
                        {order.hasQuote ? (
                          <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded font-semibold">
                            견적서 발송 완료
                          </span>
                        ) : (
                          <span className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-2 py-0.5 rounded font-semibold">
                            견적서 작성 필요
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground mb-2">{order.product}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>바이어: {order.buyer}</span>
                        <span>{order.quantity}</span>
                        <span>도착지: {order.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">${order.total.toLocaleString()}</span>
                        <ChevronRight size={16} className="text-primary" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* 배송 관리 (바이어) */}
          {activeTab === "shipping" && role === "buyer" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <Truck size={20} className="text-primary" /> 배송 관리
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                결제 완료된 주문의 배송 견적을 확인하세요
              </p>
              <div className="space-y-3">
                {shippingOrders.map((order) => (
                  <Link
                    key={order.id}
                    to={`/buyer/shipping-quotes?orderId=${order.id}`}
                    className="border border-border rounded-lg p-4 hover:border-primary hover:shadow-md transition-all block"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-sm text-foreground">{order.id}</span>
                        {order.hasQuote ? (
                          <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                            <Send size={10} />
                            견적서 수신
                          </span>
                        ) : (
                          <span className="text-xs bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded font-semibold">
                            견적 대기 중
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground mb-2">{order.product}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>셀러: {order.seller}</span>
                        <span>{order.quantity}</span>
                        <span>도착지: {order.destination}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">${order.total.toLocaleString()}</span>
                        <ChevronRight size={16} className="text-primary" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === "inquiry" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <MessageSquare size={20} className="text-primary" />
                문의하기 / 문의 내역
              </h2>
              <div className="bg-muted/30 border border-border rounded p-5 mb-6">
                <h3 className="font-semibold text-foreground mb-3">새 문의 작성</h3>
                <input type="text" placeholder="제목을 입력하세요" className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary transition-colors mb-3" />
                <textarea
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  placeholder="문의 내용을 입력하세요"
                  rows={4}
                  className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
                <button className="mt-3 bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded text-sm font-semibold transition-colors">
                  문의 제출
                </button>
              </div>
              <h3 className="font-semibold text-foreground mb-3">내 문의 내역</h3>
              <div className="space-y-3">
                {myInquiries.map((inquiry) => (
                  <div key={inquiry.id} className="border border-border rounded p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{inquiry.title}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded border ${
                        inquiry.status === "답변완료" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}>
                        {inquiry.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{inquiry.date}</div>
                    {inquiry.reply && (
                      <div className="bg-secondary border border-primary/20 rounded p-3 mt-2">
                        <div className="text-xs text-primary font-semibold mb-1">답변</div>
                        <div className="text-sm text-foreground">{inquiry.reply}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <User size={20} className="text-primary" />
                개인정보 확인 및 수정
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">이메일</label>
                  <input type="email" defaultValue="user@example.com" disabled className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none bg-muted text-muted-foreground" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">회사명</label>
                  <input type="text" defaultValue="글로벌뷰티㈜" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">담당자명</label>
                  <input type="text" defaultValue="홍길동" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">연락처</label>
                  <input type="tel" defaultValue="010-1234-5678" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">사업자등록번호</label>
                  <input type="text" defaultValue="123-45-67890" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <button className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded font-semibold text-sm transition-colors">
                  정보 수정
                </button>
              </div>
              <div className="mt-8 pt-8 border-t border-border">
                <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-600" />
                  회원 탈퇴
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  회원 탈퇴 시 모든 주문 내역, 문의 내역, 개인정보가 삭제되며 복구할 수 없습니다.
                </p>
                {!showWithdrawConfirm ? (
                  <button onClick={() => setShowWithdrawConfirm(true)} className="border border-red-300 text-red-600 hover:bg-red-50 px-6 py-2 rounded text-sm font-medium transition-colors">
                    회원 탈퇴 신청
                  </button>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-sm text-red-700 mb-3 font-semibold">정말로 탈퇴하시겠습니까?</p>
                    <div className="flex gap-2">
                      <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">탈퇴 확인</button>
                      <button onClick={() => setShowWithdrawConfirm(false)} className="border border-border text-muted-foreground hover:border-primary hover:text-primary px-4 py-2 rounded text-sm font-medium transition-colors">취소</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "address" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-5 flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                배송지 관리 · 배송대행지 주소 발급
              </h2>

              {/* 배송대행지 주소 발급 섹션 */}
              <div className="bg-secondary border border-primary/20 rounded-lg p-5 mb-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                      <MapPin size={16} className="text-primary" /> 내 배송대행지 주소
                    </h3>
                    <p className="text-xs text-muted-foreground">해외 쇼핑몰에서 이 주소로 구매하면 TradeKR 창고로 입고됩니다.</p>
                  </div>
                  <span className="text-xs bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded font-semibold">발급완료</span>
                </div>
                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">수령인</span><span className="font-semibold">{myDeliveryAddress.recipient}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">주소</span><span>{myDeliveryAddress.address}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">상세</span><span>{myDeliveryAddress.detail}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-16">관리코드</span><span className="font-mono font-bold text-primary">{myDeliveryAddress.code}</span></div>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={14} /> 배송대행지 주소 발급하기
                </button>
              </div>

              <h3 className="font-semibold text-foreground mb-3">배송지 목록</h3>
              <div className="space-y-3 mb-4">
                {myAddresses.map((addr) => (
                  <div key={addr.id} className="border border-border rounded p-4 relative">
                    {addr.isDefault && (
                      <span className="absolute top-3 right-3 text-xs bg-primary text-white px-2 py-0.5 rounded font-semibold">기본</span>
                    )}
                    <h4 className="font-semibold text-foreground mb-2">{addr.name}</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex gap-4">
                        <span className="font-medium text-foreground">{addr.recipient}</span>
                        <span>{addr.phone}</span>
                      </div>
                      <div>{addr.address}</div>
                      <div className="text-xs">{addr.detail}</div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs border border-border text-muted-foreground hover:border-primary hover:text-primary px-3 py-1.5 rounded transition-colors">수정</button>
                      {!addr.isDefault && (
                        <button className="text-xs border border-border text-muted-foreground hover:border-primary hover:text-primary px-3 py-1.5 rounded transition-colors">기본 배송지 설정</button>
                      )}
                      <button className="text-xs border border-red-300 text-red-600 hover:bg-red-50 px-3 py-1.5 rounded transition-colors">삭제</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary py-3 rounded font-medium transition-colors">
                + 새 배송지 추가
              </button>
            </div>
          )}

          {/* 바이어 배송 견적서 탭 - B2B 실무용 */}
          {activeTab === "shipping-quotes" && role === "buyer" && (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <FileText size={24} className="text-primary" />
                  <div>
                    <h2 className="text-xl font-bold text-foreground">배송 견적서 관리</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">Shipping Quotation Management</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="border border-border hover:border-primary text-muted-foreground hover:text-primary px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2">
                    <Download size={16} /> Export Excel
                  </button>
                  <button className="border border-border hover:border-primary text-muted-foreground hover:text-primary px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2">
                    <Printer size={16} /> Print
                  </button>
                </div>
              </div>

              {/* Filter & Search */}
              <div className="bg-muted/30 border border-border rounded-lg p-4 mb-5">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="견적서 번호, 주문번호, 제품명으로 검색"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <select
                    value={quoteFilter}
                    onChange={(e) => setQuoteFilter(e.target.value as any)}
                    className="px-3 py-2 border border-border rounded text-sm outline-none focus:border-primary transition-colors"
                  >
                    <option value="all">전체 상태</option>
                    <option value="pending">검토중</option>
                    <option value="approved">승인완료</option>
                    <option value="rejected">거절됨</option>
                  </select>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="date"
                      className="w-full pl-9 pr-3 py-2 border border-border rounded text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Quotation List Table */}
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-3 py-3 text-left font-semibold text-foreground w-10">
                          <input type="checkbox" className="rounded border-border" />
                        </th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">견적서 번호</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">발행일</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">유효기한</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">셀러</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">제품</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">수량</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">Incoterms</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">상태</th>
                        <th className="px-3 py-3 text-left font-semibold text-foreground">액션</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {buyerShippingQuotesList.map((quote) => {
                        const isExpanded = expandedQuote === quote.id;
                        const statusConfig = {
                          "검토중": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700" },
                          "승인완료": { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
                          "거절됨": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
                        };
                        const status = statusConfig[quote.status] || statusConfig["검토중"];

                        return (
                          <>
                            <tr key={quote.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-3 py-3">
                                <input
                                  type="checkbox"
                                  className="rounded border-border"
                                  checked={selectedQuotesForCompare.has(quote.id)}
                                  onChange={(e) => {
                                    const newSet = new Set(selectedQuotesForCompare);
                                    if (e.target.checked) {
                                      newSet.add(quote.id);
                                    } else {
                                      newSet.delete(quote.id);
                                    }
                                    setSelectedQuotesForCompare(newSet);
                                  }}
                                />
                              </td>
                              <td className="px-3 py-3">
                                <div className="font-mono font-bold text-primary text-xs">{quote.quoteNumber}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{quote.orderId}</div>
                              </td>
                              <td className="px-3 py-3 text-muted-foreground">{quote.issueDate}</td>
                              <td className="px-3 py-3">
                                <span className="text-foreground">{quote.validUntil}</span>
                                <div className="text-xs text-amber-600 mt-0.5">30일 남음</div>
                              </td>
                              <td className="px-3 py-3 font-medium text-foreground">{quote.seller}</td>
                              <td className="px-3 py-3">
                                <div className="font-medium text-foreground">{quote.product}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{quote.destination}</div>
                              </td>
                              <td className="px-3 py-3 text-foreground">{quote.quantity}</td>
                              <td className="px-3 py-3">
                                <span className="font-mono font-bold text-xs bg-muted px-2 py-1 rounded">{quote.incoterms}</span>
                              </td>
                              <td className="px-3 py-3">
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded border ${status.bg} ${status.border} ${status.text}`}>
                                  {quote.status}
                                </span>
                              </td>
                              <td className="px-3 py-3">
                                <button
                                  onClick={() => setExpandedQuote(isExpanded ? null : quote.id)}
                                  className="text-primary hover:text-primary/80 text-xs font-semibold underline"
                                >
                                  {isExpanded ? "접기" : "상세보기"}
                                </button>
                              </td>
                            </tr>

                            {/* Expanded Detail Row */}
                            {isExpanded && (
                              <tr>
                                <td colSpan={10} className="px-3 py-5 bg-muted/10">
                                  <div className="space-y-4">
                                    {/* 화물 정보 */}
                                    <div className="grid grid-cols-4 gap-4">
                                      <div className="bg-white border border-border rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Weight size={14} className="text-primary" />
                                          <span className="text-xs font-semibold text-muted-foreground uppercase">실제 중량</span>
                                        </div>
                                        <div className="font-bold text-foreground">{quote.actualWeight} kg</div>
                                      </div>
                                      <div className="bg-white border border-border rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Ruler size={14} className="text-primary" />
                                          <span className="text-xs font-semibold text-muted-foreground uppercase">부피 중량</span>
                                        </div>
                                        <div className="font-bold text-foreground">{quote.volumeWeight} kg</div>
                                      </div>
                                      <div className="bg-white border border-border rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Ruler size={14} className="text-primary" />
                                          <span className="text-xs font-semibold text-muted-foreground uppercase">박스 크기</span>
                                        </div>
                                        <div className="font-mono text-sm text-foreground">
                                          {quote.boxDimensions.width}×{quote.boxDimensions.height}×{quote.boxDimensions.depth} cm
                                        </div>
                                      </div>
                                      <div className="bg-white border border-border rounded p-3">
                                        <div className="flex items-center gap-2 mb-2">
                                          <MapPin size={14} className="text-primary" />
                                          <span className="text-xs font-semibold text-muted-foreground uppercase">출고 창고</span>
                                        </div>
                                        <div className="font-mono text-sm text-foreground">{quote.warehouseCode}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{quote.origin}</div>
                                      </div>
                                    </div>

                                    {/* 배송 옵션 비교 테이블 */}
                                    <div className="bg-white border border-border rounded">
                                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                                        <h4 className="font-semibold text-foreground flex items-center gap-2">
                                          <Plane size={16} className="text-primary" />
                                          배송 방법 비교 및 선택
                                        </h4>
                                      </div>
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-xs">
                                          <thead className="bg-muted/20 border-b border-border">
                                            <tr>
                                              <th className="px-3 py-2 text-left font-semibold text-foreground">배송 방법</th>
                                              <th className="px-3 py-2 text-left font-semibold text-foreground">운송사</th>
                                              <th className="px-3 py-2 text-left font-semibold text-foreground">예상 소요시간</th>
                                              <th className="px-3 py-2 text-right font-semibold text-foreground">운임</th>
                                              <th className="px-3 py-2 text-right font-semibold text-foreground">통관비</th>
                                              <th className="px-3 py-2 text-right font-semibold text-foreground">보험료</th>
                                              <th className="px-3 py-2 text-right font-semibold text-foreground">핸들링</th>
                                              <th className="px-3 py-2 text-right font-semibold text-foreground">총 비용</th>
                                              <th className="px-3 py-2 text-center font-semibold text-foreground">Incoterms</th>
                                              <th className="px-3 py-2 text-center font-semibold text-foreground">선택</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-border">
                                            {quote.options.map((opt, idx) => {
                                              const selected = selectedShippingOption[quote.id];
                                              const isSelected = selected === idx || quote.selectedOption === idx;
                                              return (
                                                <tr
                                                  key={idx}
                                                  className={`${isSelected ? "bg-primary/5 border-l-4 border-l-primary" : "hover:bg-muted/10"} transition-colors`}
                                                >
                                                  <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                      {opt.icon === "air" ? <Plane size={14} className="text-blue-600" /> : opt.icon === "sea" ? <Ship size={14} className="text-cyan-600" /> : <Send size={14} className="text-pink-600" />}
                                                      <div>
                                                        <div className="font-semibold text-foreground">{opt.type}</div>
                                                        <div className="text-muted-foreground">{opt.method}</div>
                                                      </div>
                                                    </div>
                                                  </td>
                                                  <td className="px-3 py-3 text-foreground">{opt.carrier}</td>
                                                  <td className="px-3 py-3 text-foreground">{opt.time}</td>
                                                  <td className="px-3 py-3 text-right font-mono text-foreground">${opt.freightCost.toLocaleString()}</td>
                                                  <td className="px-3 py-3 text-right font-mono text-foreground">${opt.customsCost.toLocaleString()}</td>
                                                  <td className="px-3 py-3 text-right font-mono text-foreground">${opt.insurance.toLocaleString()}</td>
                                                  <td className="px-3 py-3 text-right font-mono text-foreground">${opt.handling.toLocaleString()}</td>
                                                  <td className="px-3 py-3 text-right font-mono font-bold text-primary">${opt.total.toLocaleString()}</td>
                                                  <td className="px-3 py-3 text-center">
                                                    <span className="font-mono text-xs bg-muted px-2 py-1 rounded font-bold">{opt.incoterms}</span>
                                                  </td>
                                                  <td className="px-3 py-3 text-center">
                                                    {quote.status === "승인완료" && quote.selectedOption === idx ? (
                                                      <span className="text-green-700 font-semibold flex items-center justify-center gap-1">
                                                        <CheckCircle size={14} /> 선택됨
                                                      </span>
                                                    ) : quote.status !== "승인완료" ? (
                                                      <button
                                                        onClick={() => setSelectedShippingOption(prev => ({ ...prev, [quote.id]: idx }))}
                                                        className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                                                          isSelected
                                                            ? "bg-primary text-white"
                                                            : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
                                                        }`}
                                                      >
                                                        {isSelected ? "선택됨" : "선택"}
                                                      </button>
                                                    ) : null}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>

                                    {/* 특기사항 */}
                                    {quote.remarks && (
                                      <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2">
                                        <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                          <div className="text-xs font-semibold text-amber-900 mb-1">특기사항 / Remarks</div>
                                          <div className="text-xs text-amber-800">{quote.remarks}</div>
                                        </div>
                                      </div>
                                    )}

                                    {/* 액션 버튼들 */}
                                    <div className="flex items-center justify-between pt-3 border-t border-border">
                                      <div className="flex gap-2">
                                        <button className="border border-border hover:border-primary text-muted-foreground hover:text-primary px-4 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2">
                                          <Download size={14} /> PDF 다운로드
                                        </button>
                                        <button className="border border-border hover:border-primary text-muted-foreground hover:text-primary px-4 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2">
                                          <Printer size={14} /> 인쇄
                                        </button>
                                      </div>
                                      {quote.status === "승인완료" ? (
                                        <div className="flex gap-2">
                                          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                                            <CreditCard size={16} /> 결제 진행
                                          </button>
                                          <button className="border border-primary text-primary hover:bg-primary hover:text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                                            <Truck size={16} /> 배송 추적
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => alert("셀러에게 재견적 요청이 발송되었습니다.")}
                                            className="border border-amber-300 text-amber-700 hover:bg-amber-50 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                                          >
                                            <RefreshCw size={14} /> 재견적 요청
                                          </button>
                                          <button
                                            onClick={() => alert("견적서가 거절되었습니다.")}
                                            className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                                          >
                                            <XCircle size={14} /> 거절
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (selectedShippingOption[quote.id] === undefined) {
                                                alert("배송 방법을 먼저 선택해주세요.");
                                                return;
                                              }
                                              setConfirmedShippingQuotes(prev => new Set(prev).add(quote.id));
                                              alert("견적서가 승인되었습니다.");
                                            }}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2"
                                          >
                                            <FileCheck size={16} /> 승인 및 확정
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Compare Selected Quotes */}
              {selectedQuotesForCompare.size > 0 && (
                <div className="mt-4 bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={18} className="text-primary" />
                    <span className="font-semibold text-foreground">
                      {selectedQuotesForCompare.size}개 견적서 선택됨
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedQuotesForCompare(new Set())}
                      className="border border-border hover:border-primary text-muted-foreground hover:text-primary px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      선택 해제
                    </button>
                    <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                      <Eye size={16} /> 선택한 견적서 비교하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 배송대행지 주소 발급 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <MapPin size={16} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">내 배송대행지 주소</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">아래 주소로 해외 쇼핑몰에서 구매하시면 TradeKR 창고로 입고됩니다.</p>
            <div className="bg-secondary border border-primary/20 rounded p-5 mb-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">수령인</span>
                <span className="font-semibold text-foreground text-right">{myDeliveryAddress.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">주소</span>
                <span className="font-medium text-foreground text-right">{myDeliveryAddress.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">상세주소</span>
                <span className="font-medium text-foreground text-right">{myDeliveryAddress.detail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">우편번호</span>
                <span className="font-mono font-medium text-foreground">{myDeliveryAddress.zipcode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground w-20 flex-shrink-0">관리코드</span>
                <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border border-primary/30">{myDeliveryAddress.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">연락처</span>
                <span className="font-medium text-foreground">{myDeliveryAddress.phone}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 leading-relaxed mb-4">
              <strong>필수:</strong> 구매 시 수령인 이름 또는 메모란에 반드시 관리코드 <strong>{myDeliveryAddress.code}</strong>를 포함해 주세요.
            </div>
            <button
              onClick={handleCopyAddress}
              className={`w-full py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${addressCopied ? "bg-green-500 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}
            >
              {addressCopied ? (
                <><CheckCircle size={16} /> 주소가 클립보드에 복사되었습니다!</>
              ) : (
                <><Copy size={16} /> 전체 주소 복사하기</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
