import { useState } from "react";
import { Link } from "react-router";
import { FileText, Send, CheckCircle, Package, DollarSign, MapPin, AlertCircle, ChevronRight } from "lucide-react";

type Step = 1 | 2 | 3;

const categories = ["스킨케어", "메이크업", "마스크팩", "헤어케어", "바디케어", "클렌징", "더마코스메틱", "향수/아로마", "기타"];
const countries = ["한국", "중국", "일본", "무관"];
const certifications = ["FDA (미국)", "CE (유럽)", "TGA (호주)", "HSA (싱가포르)", "MSDS", "ISO 22716", "비건 인증", "cruelty-free"];

export function QuoteRequest() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    country: "한국",
    productName: "",
    category: "",
    quantity: "",
    targetPrice: "",
    budget: "",
    preferredCountry: "한국",
    deadline: "",
    packaging: "",
    certifications: [] as string[],
    detail: "",
    sampleNeeded: false,
  });

  const update = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCert = (cert: string) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-border rounded-lg p-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">소싱 요청서가 접수되었습니다</h2>
          <p className="text-muted-foreground mb-2">요청 번호: <span className="font-mono font-bold text-foreground">SRC-2024-{Math.floor(1000 + Math.random() * 9000)}</span></p>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            담당 매니저가 검토 후 <strong>영업일 기준 2~3일 이내</strong>에 견적서를 발송드립니다.<br />
            진행 상황은 마이페이지 &gt; 소싱 요청 내역에서 확인하실 수 있습니다.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/buyer" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors">
              마이페이지에서 확인
            </Link>
            <Link to="/" className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-2.5 rounded text-sm font-medium transition-colors">
              홈으로
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: "의뢰인 정보" },
    { num: 2, label: "제품 요구사항" },
    { num: 3, label: "상세 조건" },
  ];

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText size={28} />
          <h1 className="text-2xl font-bold">소싱 견적 요청서</h1>
        </div>
        <p className="text-white/80 text-sm">K-Beauty 제품 구매를 원하시면 아래 양식을 작성해 주세요. 전문 매니저가 최적의 공급업체와 견적을 안내드립니다.</p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 flex items-start gap-3">
        <AlertCircle size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>견적 요청 절차:</strong> 요청서 제출 → 담당 매니저 배정 → 공급업체 소싱 → 견적서 발송 (2~3 영업일 소요)
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 flex-shrink-0 ${step >= s.num ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                step > s.num ? "bg-primary border-primary text-white" :
                step === s.num ? "border-primary text-primary bg-white" :
                "border-border text-muted-foreground bg-white"
              }`}>
                {step > s.num ? <CheckCircle size={14} /> : s.num}
              </div>
              <span className={`text-sm font-medium whitespace-nowrap ${step === s.num ? "text-primary" : step > s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${step > s.num ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-lg p-6">
        {/* Step 1: 의뢰인 정보 */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Package size={20} className="text-primary" /> 의뢰인 정보
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">회사명 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="예: 글로벌뷰티㈜"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">담당자명 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  placeholder="홍길동"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">이메일 <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="buyer@company.com"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">연락처</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  placeholder="+1-555-0000"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1.5">바이어 국가</label>
                <select
                  value={form.country}
                  onChange={(e) => update("country", e.target.value)}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                >
                  {["미국", "일본", "중국", "호주", "싱가포르", "영국", "독일", "한국", "기타"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: 제품 요구사항 */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <Package size={20} className="text-primary" /> 제품 요구사항
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-foreground mb-1.5">제품명 / 요청 제품 설명 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.productName}
                    onChange={(e) => update("productName", e.target.value)}
                    placeholder="예: 비타민C 세럼 30mL OEM"
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">카테고리 <span className="text-red-500">*</span></label>
                  <select
                    value={form.category}
                    onChange={(e) => update("category", e.target.value)}
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  >
                    <option value="">선택하세요</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">요청 수량 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.quantity}
                    onChange={(e) => update("quantity", e.target.value)}
                    placeholder="예: 2,000개"
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">개당 목표 단가</label>
                  <input
                    type="text"
                    value={form.targetPrice}
                    onChange={(e) => update("targetPrice", e.target.value)}
                    placeholder="예: $8~$12"
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">총 예산 <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={form.budget}
                    onChange={(e) => update("budget", e.target.value)}
                    placeholder="예: $15,000~$20,000"
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    <MapPin size={13} className="inline mr-1" />선호 생산 국가
                  </label>
                  <select
                    value={form.preferredCountry}
                    onChange={(e) => update("preferredCountry", e.target.value)}
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  >
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">납기 희망일</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => update("deadline", e.target.value)}
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">패키징 요구사항</label>
                  <input
                    type="text"
                    value={form.packaging}
                    onChange={(e) => update("packaging", e.target.value)}
                    placeholder="예: 유리병, 개별 포장, 화이트라벨"
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: 상세 조건 */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-5 flex items-center gap-2">
              <DollarSign size={20} className="text-primary" /> 상세 조건 및 인증
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">필요 인증 (복수 선택 가능)</label>
                <div className="grid grid-cols-4 gap-2">
                  {certifications.map((cert) => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleCert(cert)}
                      className={`py-2 px-3 text-xs rounded border transition-colors text-left ${
                        form.certifications.includes(cert)
                          ? "bg-primary text-white border-primary"
                          : "border-border text-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">상세 요구사항 <span className="text-red-500">*</span></label>
                <textarea
                  value={form.detail}
                  onChange={(e) => update("detail", e.target.value)}
                  rows={5}
                  placeholder="성분 제한, 특수 인증 요구사항, 참고 제품, 기타 특이사항 등을 상세히 기재해 주세요."
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/30 rounded border border-border">
                <input
                  type="checkbox"
                  id="sample"
                  checked={form.sampleNeeded}
                  onChange={(e) => update("sampleNeeded", e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="sample" className="text-sm text-foreground cursor-pointer">
                  본 오더 전 샘플 수령을 원합니다 (샘플비 별도 협의)
                </label>
              </div>

              {/* 요약 */}
              <div className="bg-secondary border border-primary/20 rounded p-4">
                <h3 className="text-sm font-semibold text-foreground mb-3">요청서 요약</h3>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between"><span>회사명</span><span className="text-foreground font-medium">{form.companyName || "—"}</span></div>
                  <div className="flex justify-between"><span>제품명</span><span className="text-foreground font-medium">{form.productName || "—"}</span></div>
                  <div className="flex justify-between"><span>수량</span><span className="text-foreground font-medium">{form.quantity || "—"}</span></div>
                  <div className="flex justify-between"><span>예산</span><span className="text-primary font-bold">{form.budget || "—"}</span></div>
                  <div className="flex justify-between"><span>납기</span><span className="text-foreground font-medium">{form.deadline || "—"}</span></div>
                  <div className="flex justify-between"><span>인증</span><span className="text-foreground font-medium">{form.certifications.length > 0 ? form.certifications.join(", ") : "없음"}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          <button
            onClick={() => step > 1 && setStep((prev) => (prev - 1) as Step)}
            disabled={step === 1}
            className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-2.5 rounded text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            이전
          </button>
          <div className="flex items-center gap-1">
            {steps.map((s) => (
              <div key={s.num} className={`w-2 h-2 rounded-full transition-colors ${step === s.num ? "bg-primary" : "bg-muted"}`} />
            ))}
          </div>
          {step < 3 ? (
            <button
              onClick={() => setStep((prev) => (prev + 1) as Step)}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded text-sm font-semibold transition-colors flex items-center gap-2"
            >
              다음 <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Send size={16} /> 요청서 제출
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
