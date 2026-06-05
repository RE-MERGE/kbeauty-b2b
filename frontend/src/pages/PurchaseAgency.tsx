import { useState } from "react";
import { CheckCircle, Search, ClipboardList, Package, Truck, FileText, ArrowRight, Shield, Clock, Globe, X } from "lucide-react";

const steps = [
  { num: "01", icon: <Search size={24} />, title: "제품 소싱 요청", desc: "원하는 제품 정보와 수량, 예산을 입력하면 TradeKR 전문 바이어가 전 세계 공급업체를 탐색합니다." },
  { num: "02", icon: <ClipboardList size={24} />, title: "견적 비교 & 확정", desc: "3~5개 공급업체 견적을 비교 제공. 가격·품질·납기를 검토 후 최적 공급업체를 선택하세요." },
  { num: "03", icon: <Shield size={24} />, title: "안전 결제", desc: "에스크로 방식으로 결제 보호. 상품 검수 완료 전까지 대금은 TradeKR이 보관합니다." },
  { num: "04", icon: <Package size={24} />, title: "품질 검수", desc: "현지 검수 파트너가 출하 전 품질·수량·포장 상태를 확인하고 검수 리포트를 발송합니다." },
  { num: "05", icon: <Truck size={24} />, title: "배송 & 통관", desc: "항공·해운 중 선택. 통관 서류 작성과 세관 신고를 대행하여 국내 목적지까지 배송합니다." },
  { num: "06", icon: <FileText size={24} />, title: "정산 & 완료", desc: "배송 완료 후 세금계산서 발행 및 비용 정산. 거래 이력은 대시보드에서 관리됩니다." },
];

const plans = [
  {
    name: "스타터",
    price: "무료",
    period: "",
    desc: "소규모 수입 첫 시작에 적합",
    features: ["소싱 요청 월 3건", "견적 비교 3사", "기본 품질 검수", "이메일 지원"],
    highlight: false,
    cta: "무료 시작",
  },
  {
    name: "비즈니스",
    price: "₩89,000",
    period: "/월",
    desc: "정기 수입 기업에 최적화",
    features: ["소싱 요청 월 20건", "견적 비교 5사", "정밀 품질 검수 + 리포트", "전담 매니저 배정", "우선 처리 (48시간 내)", "FTA 관세 컨설팅"],
    highlight: true,
    cta: "14일 무료 체험",
  },
  {
    name: "엔터프라이즈",
    price: "협의",
    period: "",
    desc: "대량 구매·맞춤 계약",
    features: ["소싱 요청 무제한", "전용 소싱팀 구성", "공장 실사 대행", "전용 창고 운영", "SLA 보장 계약", "API 연동 지원"],
    highlight: false,
    cta: "상담 신청",
  },
];

const regions = [
  { flag: "🇰🇷", country: "한국", city: "서울·인천·수원", categories: "스킨케어, 메이크업, 마스크팩, OEM/ODM", partners: 480 },
  { flag: "🇨🇳", country: "중국", city: "상하이·광저우", categories: "원료·원자재, 패키징·용기", partners: 120 },
  { flag: "🇯🇵", country: "일본", city: "도쿄·오사카", categories: "더마코스메틱, 헤어케어, 기능성 성분", partners: 64 },
  { flag: "🇹🇼", country: "대만", city: "타이페이·타이중", categories: "OEM 화장품, 천연 성분 추출물", partners: 38 },
  { flag: "🇺🇸", country: "미국", city: "뉴욕·LA", categories: "클린뷰티, 비건 인증 원료", partners: 28 },
  { flag: "🇫🇷", country: "프랑스", city: "파리·리옹", categories: "향수 원료, 럭셔리 성분, 패키징", partners: 22 },
];

export function PurchaseAgency() {
  const [formData, setFormData] = useState({ product: "", quantity: "", budget: "", country: "", detail: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div className="font-[Inter,sans-serif]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2d1a2e] to-[#1a0e1e] text-white py-16">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-block bg-primary text-xs font-mono px-2 py-1 rounded mb-4 tracking-wider uppercase">구매대행 서비스</div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              K-Beauty 제품을<br />
              <span className="text-accent">최적 조건으로 소싱</span>합니다
            </h1>
            <p className="text-[#ccc] text-base leading-relaxed mb-6">
              언어 장벽, 품질 리스크, 물류 복잡성을 TradeKR이 해결합니다. K-Beauty 전문 바이어가 최적의 공급업체를 찾아드립니다.
            </p>
            <div className="flex gap-4">
              <a href="#request-form" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded font-semibold transition-colors">
                소싱 요청하기
              </a>
              <a href="#how-it-works" className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded font-medium transition-colors">
                서비스 안내
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-4 divide-x divide-white/20">
          {[
            { label: "누적 소싱 건수", value: "142,000+" },
            { label: "파트너 공급업체", value: "8,200+" },
            { label: "평균 비용 절감", value: "23%" },
            { label: "고객 만족도", value: "98.4%" },
          ].map((s) => (
            <div key={s.label} className="py-4 text-center">
              <div className="font-bold text-2xl font-mono">{s.value}</div>
              <div className="text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-12">
        {/* How It Works */}
        <section id="how-it-works" className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-2">진행 프로세스</h2>
          <p className="text-muted-foreground mb-8">6단계로 완성되는 안전한 글로벌 구매대행</p>
          <div className="grid grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="bg-white border border-border rounded p-6 hover:border-primary hover:shadow-md transition-all group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="font-mono text-xs text-primary font-bold bg-secondary px-2 py-0.5 rounded">{step.num}</div>
                  <div className="text-primary group-hover:scale-110 transition-transform">{step.icon}</div>
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Request Form */}
        <section id="request-form" className="bg-white border border-border rounded p-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">소싱 요청서 작성</h2>
          <p className="text-muted-foreground mb-6">기본 정보를 입력하면 24시간 내 담당 매니저가 연락드립니다</p>
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1.5">제품명 / 품목</label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                placeholder="예: 산업용 선풍기 3단 모터"
                className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1.5">필요 수량</label>
              <input
                type="text"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="예: 500개"
                className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1.5">예산 범위</label>
              <input
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="예: $5,000 ~ $8,000"
                className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1.5">선호 소싱 국가</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-white"
              >
                <option value="">국가 선택 (없으면 무관)</option>
                <option>한국</option>
                <option>중국</option>
                <option>일본</option>
                <option>대만</option>
                <option>미국</option>
                <option>프랑스</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-[#333] mb-1.5">상세 요구사항</label>
              <textarea
                value={formData.detail}
                onChange={(e) => setFormData({ ...formData, detail: e.target.value })}
                placeholder="재질, 규격, 인증, 납기 등 추가 요구사항을 입력하세요"
                rows={4}
                className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>
          <button
            onClick={() => setShowSuccessModal(true)}
            className="mt-5 bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded font-semibold text-sm transition-colors flex items-center gap-2"
          >
            소싱 요청 제출 <ArrowRight size={16} />
          </button>
        </section>
      </div>

      {/* 소싱 요청 제출 완료 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowSuccessModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">소싱 요청이 접수되었습니다!</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                담당 매니저가 검토 후 <strong className="text-foreground">24시간 내</strong> 이메일로 연락드립니다.<br />
                요청 번호를 확인하고 진행 상황을 마이페이지에서 조회하세요.
              </p>
              <div className="bg-secondary border border-primary/20 rounded p-4 mb-5 text-left">
                <div className="text-xs text-muted-foreground mb-1">접수 번호</div>
                <div className="font-mono font-bold text-primary text-lg">SRC-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9000) + 1000)}</div>
                <div className="text-xs text-muted-foreground mt-2">접수 시각: {new Date().toLocaleString("ko-KR")}</div>
              </div>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => { setShowSuccessModal(false); setFormData({ product: "", quantity: "", budget: "", country: "", detail: "" }); }}
                  className="border border-border text-muted-foreground hover:border-primary hover:text-primary px-5 py-2.5 rounded text-sm font-medium transition-colors"
                >
                  닫기
                </button>
                <a href="/mypage" className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded text-sm font-semibold transition-colors">
                  마이페이지에서 확인
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
