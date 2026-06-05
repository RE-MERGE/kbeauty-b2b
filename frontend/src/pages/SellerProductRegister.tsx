import { useState } from "react";
import { Link } from "react-router";
import { Package, Upload, CheckCircle, ChevronLeft, Plus, X, AlertCircle } from "lucide-react";

const categories = ["스킨케어", "메이크업", "마스크팩", "헤어케어", "바디케어", "클렌징", "더마코스메틱", "향수/아로마"];
const certifications = ["FDA (미국)", "CE (유럽)", "TGA (호주)", "HSA (싱가포르)", "ISO 22716", "비건 인증", "cruelty-free", "MSDS"];
const packagingTypes = ["유리병", "플라스틱 튜브", "펌프형", "스파우트 파우치", "에어리스 펌프", "메탈 튜브", "종이 패키지", "기타"];

type Ingredient = { name: string; pct: string };

export function SellerProductRegister() {
  const [submitted, setSubmitted] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([{ name: "", pct: "" }]);
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [selectedPackaging, setSelectedPackaging] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    productName: "",
    engName: "",
    category: "",
    volume: "",
    moq: "",
    unitPrice: "",
    leadTime: "",
    shelfLife: "",
    skinType: "",
    mainIngredient: "",
    description: "",
    usage: "",
    oemAvailable: false,
    sampleAvailable: false,
    whiteLabel: false,
  });

  const update = (field: string, value: string | boolean) => setForm((p) => ({ ...p, [field]: value }));

  const addIngredient = () => setIngredients((p) => [...p, { name: "", pct: "" }]);
  const removeIngredient = (i: number) => setIngredients((p) => p.filter((_, idx) => idx !== i));
  const updateIngredient = (i: number, field: "name" | "pct", val: string) => {
    setIngredients((p) => p.map((ing, idx) => idx === i ? { ...ing, [field]: val } : ing));
  };

  const toggleCert = (c: string) => setSelectedCerts((p) => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const togglePkg = (c: string) => setSelectedPackaging((p) => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  if (submitted) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-border rounded-lg p-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">제품이 등록되었습니다</h2>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            관리자 검토 후 <strong>1~2 영업일 이내</strong>에 제품이 플랫폼에 게시됩니다.<br />
            셀러 페이지에서 등록 제품을 확인하실 수 있습니다.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/seller" className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors">
              셀러 페이지로
            </Link>
            <button
              onClick={() => { setSubmitted(false); setForm({ productName: "", engName: "", category: "", volume: "", moq: "", unitPrice: "", leadTime: "", shelfLife: "", skinType: "", mainIngredient: "", description: "", usage: "", oemAvailable: false, sampleAvailable: false, whiteLabel: false }); setIngredients([{ name: "", pct: "" }]); setSelectedCerts([]); setSelectedPackaging([]); }}
              className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-2.5 rounded text-sm font-medium transition-colors"
            >
              추가 등록
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2e1a] to-[#2d4a35] text-white rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Package size={28} />
          <h1 className="text-2xl font-bold">제품 등록</h1>
        </div>
        <p className="text-white/80 text-sm">TradeKR 플랫폼에 K-Beauty 제품을 등록하세요. 전 세계 바이어에게 노출됩니다.</p>
      </div>

      <Link to="/seller" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-5">
        <ChevronLeft size={14} /> 셀러 페이지로
      </Link>

      <div className="space-y-5">
        {/* 기본 정보 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-bold text-foreground mb-5 flex items-center gap-2">
            <Package size={18} className="text-primary" /> 기본 제품 정보
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">제품명 (한국어) <span className="text-red-500">*</span></label>
              <input type="text" value={form.productName} onChange={(e) => update("productName", e.target.value)} placeholder="예: 히알루론산 에센스 50mL" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">제품명 (영어)</label>
              <input type="text" value={form.engName} onChange={(e) => update("engName", e.target.value)} placeholder="Hyaluronic Acid Essence 50mL" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">카테고리 <span className="text-red-500">*</span></label>
              <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors">
                <option value="">선택하세요</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">용량/중량 <span className="text-red-500">*</span></label>
              <input type="text" value={form.volume} onChange={(e) => update("volume", e.target.value)} placeholder="예: 50mL, 30g" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">최소 발주량 (MOQ) <span className="text-red-500">*</span></label>
              <input type="text" value={form.moq} onChange={(e) => update("moq", e.target.value)} placeholder="예: 1,000개" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">단가 (USD) <span className="text-red-500">*</span></label>
              <input type="text" value={form.unitPrice} onChange={(e) => update("unitPrice", e.target.value)} placeholder="예: $2.5" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">납기 (생산 소요일)</label>
              <input type="text" value={form.leadTime} onChange={(e) => update("leadTime", e.target.value)} placeholder="예: 21일" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">유통기한</label>
              <input type="text" value={form.shelfLife} onChange={(e) => update("shelfLife", e.target.value)} placeholder="예: 36개월" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">피부 타입</label>
              <input type="text" value={form.skinType} onChange={(e) => update("skinType", e.target.value)} placeholder="예: 모든 피부, 민감성, 건성" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
            </div>
          </div>
        </div>

        {/* 옵션 체크박스 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-bold text-foreground mb-4">공급 옵션</h2>
          <div className="flex gap-6">
            {[
              { field: "oemAvailable", label: "OEM/ODM 가능", desc: "바이어 브랜드로 생산 가능" },
              { field: "sampleAvailable", label: "샘플 제공 가능", desc: "본오더 전 샘플 발송" },
              { field: "whiteLabel", label: "화이트라벨 가능", desc: "라벨 커스터마이징" },
            ].map((opt) => (
              <label key={opt.field} className="flex items-start gap-3 cursor-pointer p-4 border border-border rounded hover:border-primary transition-colors flex-1">
                <input
                  type="checkbox"
                  checked={form[opt.field as keyof typeof form] as boolean}
                  onChange={(e) => update(opt.field, e.target.checked)}
                  className="mt-0.5 accent-primary"
                />
                <div>
                  <div className="text-sm font-medium text-foreground">{opt.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* 인증 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-bold text-foreground mb-4">보유 인증</h2>
          <div className="grid grid-cols-4 gap-2">
            {certifications.map((cert) => (
              <button key={cert} type="button" onClick={() => toggleCert(cert)} className={`py-2 px-3 text-xs rounded border transition-colors text-left ${selectedCerts.includes(cert) ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary hover:text-primary"}`}>
                {cert}
              </button>
            ))}
          </div>
        </div>

        {/* 패키징 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-bold text-foreground mb-4">패키징 유형</h2>
          <div className="grid grid-cols-4 gap-2">
            {packagingTypes.map((pkg) => (
              <button key={pkg} type="button" onClick={() => togglePkg(pkg)} className={`py-2 px-3 text-xs rounded border transition-colors ${selectedPackaging.includes(pkg) ? "bg-primary text-white border-primary" : "border-border text-foreground hover:border-primary hover:text-primary"}`}>
                {pkg}
              </button>
            ))}
          </div>
        </div>

        {/* 주요 성분 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-foreground">주요 성분</h2>
            <button onClick={addIngredient} className="text-xs text-primary hover:underline flex items-center gap-1">
              <Plus size={12} /> 성분 추가
            </button>
          </div>
          <div className="space-y-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="text" value={ing.name} onChange={(e) => updateIngredient(i, "name", e.target.value)} placeholder="성분명 (예: 히알루론산)" className="flex-1 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                <input type="text" value={ing.pct} onChange={(e) => updateIngredient(i, "pct", e.target.value)} placeholder="함량 %" className="w-24 border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary" />
                {ingredients.length > 1 && (
                  <button onClick={() => removeIngredient(i)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 설명 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-bold text-foreground mb-4">제품 상세 설명</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">제품 특징 및 효능 <span className="text-red-500">*</span></label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} rows={4} placeholder="제품의 주요 특징, 효능, 차별점 등을 기재하세요." className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">사용 방법</label>
              <textarea value={form.usage} onChange={(e) => update("usage", e.target.value)} rows={3} placeholder="사용 순서, 용량, 주의사항 등을 기재하세요." className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" />
            </div>
          </div>
        </div>

        {/* 이미지 업로드 */}
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Upload size={18} className="text-primary" /> 제품 이미지 업로드
          </h2>
          <div className="bg-muted/30 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload size={28} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-foreground font-medium mb-1">이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-muted-foreground">JPG, PNG, WEBP 지원 · 최대 10MB · 최대 6장</p>
          </div>
          <div className="flex items-start gap-2 mt-3 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
            <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
            첫 번째 이미지가 대표 이미지로 설정됩니다. 고화질 정사각형 이미지 권장 (1000×1000px 이상)
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pb-4">
          <Link to="/seller" className="border border-border text-foreground hover:border-primary hover:text-primary px-8 py-3 rounded text-sm font-medium transition-colors">
            취소
          </Link>
          <div className="flex gap-3">
            <button className="border border-primary text-primary hover:bg-secondary px-6 py-3 rounded text-sm font-semibold transition-colors">
              임시저장
            </button>
            <button
              onClick={() => setSubmitted(true)}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded text-sm font-semibold transition-colors flex items-center gap-2"
            >
              <Package size={16} /> 제품 등록 신청
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
