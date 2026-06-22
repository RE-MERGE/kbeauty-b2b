import { useState } from "react";
import { useNavigate } from "react-router";
import {
  Package, ChevronRight, RotateCcw,
} from "lucide-react";

type RequestStatus = "대기중" | "견적수신" | "승인" | "거절" | "재요청됨" | "협의중";
type BidStatus = "검토중" | "승인" | "거절" | "협의중" | "샘플대기중" | "샘플발송됨";
type SourcingType = "READY" | "CUSTOM";

export interface Bid {
  bidId: string;
  supplierName: string;
  unitPrice?: number;
  totalBudget?: number;
  samplePrice?: number;
  availableDate: string;
  comment: string;
  quoteFileUrl?: string;
  status: BidStatus;
  submittedAt: string;
}

export interface SourcingRequest {
  id: string;
  type: SourcingType;
  productName: string;
  quantity: number;
  deliveryDate: string;
  detail: string;
  unitPrice?: number;
  mainCategory?: string;
  subCategory?: string;
  totalBudget?: number;
  needSample?: "Y" | "N";
  workFileCount?: number;
  status: RequestStatus;
  bids: Bid[];
  createdAt: string;
  prefillData: Record<string, unknown>;
}

export const DUMMY_REQUESTS: SourcingRequest[] = [
  {
    id: "REQ-001", type: "READY", productName: "여성 린넨 와이드 팬츠",
    quantity: 200, unitPrice: 18000, deliveryDate: "2026-06-20",
    detail: "* 컬러/사이즈/수량: 아이보리 / S / 50장\n* 아이보리 / M / 80장\n* 베이지 / M / 70장",
    mainCategory: "하의", subCategory: "팬츠",
    status: "견적수신", createdAt: "2026-06-01",
    prefillData: {},
    bids: [
      { bidId: "BID-001", supplierName: "르블랑", unitPrice: 16500, availableDate: "2026-06-18", comment: "인증서 보유, 당일 퀵 가능합니다.", status: "검토중", submittedAt: "2026-06-03" },
      { bidId: "BID-002", supplierName: "패션마트", unitPrice: 17200, availableDate: "2026-06-19", comment: "동일 소재 재고 보유 중입니다.", status: "검토중", submittedAt: "2026-06-04" },
      { bidId: "BID-003", supplierName: "스타일플러스", unitPrice: 15800, availableDate: "2026-06-20", comment: "대량 주문 시 추가 할인 가능합니다.", status: "검토중", submittedAt: "2026-06-04" },
    ],
  },
  {
    id: "REQ-002", type: "READY", productName: "플리츠 미디 스커트",
    quantity: 210, unitPrice: 22000, deliveryDate: "2026-06-15",
    detail: "* 블랙 / S / 70장\n* 네이비 / M / 70장\n* 네이비 / L / 70장",
    mainCategory: "하의", subCategory: "스커트",
    status: "승인", createdAt: "2026-05-25",
    prefillData: {},
    bids: [
      { bidId: "BID-004", supplierName: "트렌드온", unitPrice: 21000, availableDate: "2026-06-14", comment: "", status: "승인", submittedAt: "2026-05-27" },
    ],
  },
  {
    id: "REQ-003", type: "READY", productName: "크롭 볼레로 가디건",
    quantity: 100, unitPrice: 25000, deliveryDate: "2026-07-01",
    detail: "* 화이트 / S / 30장\n* 베이지 / M / 40장\n* 베이지 / L / 30장",
    mainCategory: "상의", subCategory: "가디건",
    status: "대기중", createdAt: "2026-06-05",
    prefillData: {},
    bids: [],
  },
  {
    id: "CUS-001", type: "CUSTOM", productName: "자체브랜드 시그니처 트렌치코트",
    quantity: 150, totalBudget: 12000000, deliveryDate: "2026-07-20",
    detail: "3페이지 컬러 샘플은 카멜 우선 진행 부탁드립니다. 안감 퀄리티 특히 신경써주세요.",
    mainCategory: "아우터", subCategory: "코트", needSample: "Y", workFileCount: 3,
    status: "견적수신", createdAt: "2026-06-02",
    prefillData: {},
    bids: [
      { bidId: "BID-005", supplierName: "르블랑", totalBudget: 11000000, samplePrice: 80000, availableDate: "2026-07-18", comment: "동일 소재 납품 경력 5년입니다.", quoteFileUrl: "quote_BID-005.pdf", status: "검토중", submittedAt: "2026-06-05" },
      { bidId: "BID-005B", supplierName: "르블랑", totalBudget: 10500000, samplePrice: 70000, availableDate: "2026-07-22", comment: "납기를 늦추는 대신 단가 낮춘 안. 안감 업그레이드 포함.", quoteFileUrl: "quote_BID-005B.pdf", status: "검토중", submittedAt: "2026-06-08" },
      { bidId: "BID-006", supplierName: "코트팩토리", totalBudget: 11500000, samplePrice: 60000, availableDate: "2026-07-15", comment: "샘플 1주일 내 가능합니다.", quoteFileUrl: "quote_BID-006.pdf", status: "검토중", submittedAt: "2026-06-06" },
    ],
  },
  {
    id: "CUS-002", type: "CUSTOM", productName: "OEM 요가복 세트",
    quantity: 500, totalBudget: 8500000, deliveryDate: "2026-07-10",
    detail: "소재 샘플 먼저 받아보고 싶습니다.",
    mainCategory: "스포츠/애슬레저", subCategory: "요가복", needSample: "Y", workFileCount: 2,
    status: "협의중", createdAt: "2026-05-28",
    prefillData: {},
    bids: [
      { bidId: "BID-007", supplierName: "핏스튜디오", totalBudget: 8200000, samplePrice: 50000, availableDate: "2026-07-08", comment: "", quoteFileUrl: "quote_BID-007.pdf", status: "샘플대기중", submittedAt: "2026-05-30" },
    ],
  },
  {
    id: "CUS-003", type: "CUSTOM", productName: "ODM 니트 가디건 시즌 라인",
    quantity: 200, totalBudget: 6000000, deliveryDate: "2026-08-01",
    detail: "작업지시서 외 추가 요청사항 없습니다.",
    mainCategory: "상의", subCategory: "니트", needSample: "N", workFileCount: 4,
    status: "대기중", createdAt: "2026-06-06",
    prefillData: {},
    bids: [],
  },
];

const STATUS_STYLE: Record<RequestStatus, string> = {
  "대기중":   "bg-secondary text-muted-foreground border-border",
  "견적수신": "bg-blue-50 text-blue-600 border-blue-200",
  "승인":     "bg-green-50 text-green-600 border-green-200",
  "거절":     "bg-red-50 text-red-500 border-red-200",
  "재요청됨": "bg-amber-50 text-amber-600 border-amber-200",
  "협의중":   "bg-purple-50 text-purple-600 border-purple-200",
};

function RequestRow({ request, onClick }: { request: SourcingRequest; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-border rounded-lg px-5 py-4 hover:border-primary hover:shadow-sm transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-[10px] text-muted-foreground font-mono">{request.id}</span>
            <span className="text-[10px] bg-secondary text-primary px-2 py-0.5 rounded">
              {request.mainCategory}{request.subCategory ? ` > ${request.subCategory}` : ""}
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[request.status]}`}>
              {request.status}
            </span>
          </div>
          <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
            {request.productName}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{request.createdAt} 등록</div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-center flex-shrink-0">
          <div>
            <div className="font-mono font-bold text-sm text-foreground">{request.quantity.toLocaleString()}벌</div>
            <div className="text-[10px] text-muted-foreground">희망수량</div>
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-foreground">
              {request.type === "READY"
                ? `${request.unitPrice?.toLocaleString()}원`
                : `${((request.totalBudget ?? 0) / 10000).toLocaleString()}만원`}
            </div>
            <div className="text-[10px] text-muted-foreground">{request.type === "READY" ? "희망단가" : "희망예산"}</div>
          </div>
          <div>
            <div className="font-mono font-bold text-sm text-foreground">{request.deliveryDate.slice(5)}</div>
            <div className="text-[10px] text-muted-foreground">희망납기</div>
          </div>
          <div>
            <div className={`font-mono font-bold text-sm ${request.bids.length > 0 ? "text-blue-600" : "text-muted-foreground"}`}>
              {request.bids.length}건
            </div>
            <div className="text-[10px] text-muted-foreground">접수견적</div>
          </div>
        </div>
        <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>
    </div>
  );
}

export function BuyerSourcingList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SourcingType>("READY");

  const handleTabChange = (tab: SourcingType) => setActiveTab(tab);

  const filtered = DUMMY_REQUESTS.filter((r) => r.type === activeTab);
  const readyCount = DUMMY_REQUESTS.filter((r) => r.type === "READY").length;
  const customCount = DUMMY_REQUESTS.filter((r) => r.type === "CUSTOM").length;

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <div className="flex items-center gap-2 mb-1">
        <Package size={22} className="text-primary" />
        <h1 className="text-2xl font-bold text-foreground">소싱 요청 관리</h1>
      </div>
      <p className="text-sm text-muted-foreground mb-6">요청을 선택해 견적을 확인하고 진행하세요.</p>

      <div className="flex gap-1 bg-secondary border border-border rounded-lg p-1 mb-6 w-fit">
        {(["READY", "CUSTOM"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab)}
            className={`px-5 py-2 rounded text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "bg-white text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "READY" ? "🏷️ 기성품 사입" : "✂️ 주문제작"}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-mono ${activeTab === tab ? "bg-primary text-white" : "bg-border text-muted-foreground"}`}>
              {tab === "READY" ? readyCount : customCount}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((req) => (
          <RequestRow
            key={req.id}
            request={req}
            onClick={() => {
              if (req.type === "CUSTOM") {
                navigate(`/buyer/sourcing-detail`, { state: { requestId: req.id } });
              } else {
                navigate(`/buyer/sourcing-detail`, { state: { requestId: req.id } });
              }
            }}
          />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-medium">등록된 소싱 요청이 없습니다</div>
          </div>
        )}
      </div>
    </div>
  );
}
