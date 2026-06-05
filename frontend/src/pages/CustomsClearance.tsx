import { useState } from "react";
import { FileText, Search, AlertCircle, CheckCircle, ArrowRight, TrendingDown } from "lucide-react";

const hsExamples = [
  { code: "3304.99", desc: "기타 미용 제품 (스킨케어, 에센스, 크림)", baseRate: "6.5%", ftaRate: "0% (한-중 FTA)", category: "스킨케어" },
  { code: "3304.10", desc: "립 메이크업 제품 (립스틱, 립틴트)", baseRate: "6.5%", ftaRate: "0% (한-베트남 FTA)", category: "메이크업" },
  { code: "3304.20", desc: "눈 메이크업 제품 (아이섀도, 마스카라)", baseRate: "6.5%", ftaRate: "0% (한-EU FTA)", category: "메이크업" },
  { code: "3304.91", desc: "파우더류 (파운데이션, 파우더)", baseRate: "6.5%", ftaRate: "0% (한-미국 FTA)", category: "메이크업" },
  { code: "3304.30", desc: "매니큐어·페디큐어 제품", baseRate: "6.5%", ftaRate: "0% (한-ASEAN)", category: "네일케어" },
  { code: "3305.10", desc: "샴푸", baseRate: "6.5%", ftaRate: "0% (한-중 FTA)", category: "헤어케어" },
  { code: "3305.90", desc: "기타 헤어케어 제품 (트리트먼트, 헤어오일)", baseRate: "6.5%", ftaRate: "0% (한-EU FTA)", category: "헤어케어" },
  { code: "3307.41", desc: "향수 (오드퍼퓸, 오드뚜왈레)", baseRate: "6.5%", ftaRate: "2% (한-EU FTA)", category: "향수" },
  { code: "3307.90", desc: "기타 미용·위생 제품 (마스크팩, 바디스크럽)", baseRate: "6.5%", ftaRate: "0% (한-중 FTA)", category: "바디케어" },
  { code: "3401.11", desc: "화장 비누·세안 전용 바 클렌저", baseRate: "8%", ftaRate: "0% (한-ASEAN)", category: "클렌징" },
];

const ftaAgreements = [
  { partner: "중국", flag: "🇨🇳", signed: "2015", coverage: "화장품 품목 90%+", saving: "평균 6~12%" },
  { partner: "EU (27개국)", flag: "🇪🇺", signed: "2011", coverage: "화장품 품목 97%+", saving: "평균 4~8%" },
  { partner: "미국", flag: "🇺🇸", signed: "2012", coverage: "화장품 품목 95%+", saving: "평균 4~6.5%" },
  { partner: "베트남", flag: "🇻🇳", signed: "2015", coverage: "화장품 품목 90%+", saving: "평균 5~6.5%" },
  { partner: "ASEAN", flag: "🌏", signed: "2007", coverage: "화장품 품목 90%", saving: "평균 4~6.5%" },
  { partner: "일본", flag: "🇯🇵", signed: "2008", coverage: "화장품 품목 80%", saving: "평균 3~5%" },
];

const requiredDocs = [
  { doc: "상업 송장 (Commercial Invoice)", required: true, note: "원본 3부 — 제품명·수량·단가·원산지 포함" },
  { doc: "포장 명세서 (Packing List)", required: true, note: "원본 1부" },
  { doc: "선하증권 또는 항공화물운송장 (B/L 또는 AWB)", required: true, note: "원본 3부" },
  { doc: "원산지증명서 (Certificate of Origin)", required: false, note: "FTA 관세 적용 시 필수 (한국산 K-Beauty 제품 해당)" },
  { doc: "화장품 성분표 (INCI List)", required: false, note: "수입국 규정에 따라 요구 — 미국, EU, 일본 등" },
  { doc: "자유판매증명서 (CFS – Certificate of Free Sale)", required: false, note: "화장품 수출 시 수입국 요구 빈번" },
  { doc: "기능성화장품 심사결과통지서", required: false, note: "기능성 성분 함유 제품 수출 시 선택 첨부" },
];

export function CustomsClearance() {
  const [hsSearch, setHsSearch] = useState("");
  const [invoiceAmount, setInvoiceAmount] = useState("");
  const [dutyRate, setDutyRate] = useState("6.5");
  const [selectedFta, setSelectedFta] = useState("");

  const amount = parseFloat(invoiceAmount) || 0;
  const rate = parseFloat(dutyRate) / 100;
  const ftaRate = selectedFta ? rate * 0.15 : rate;
  const normalDuty = amount * rate;
  const ftaDuty = amount * ftaRate;
  const saving = normalDuty - ftaDuty;

  const filteredHs = hsExamples.filter(
    (h) => h.desc.includes(hsSearch) || h.code.includes(hsSearch) || h.category.includes(hsSearch)
  );

  return (
    <div className="font-[Inter,sans-serif]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2d1a2e] to-[#1a0e2e] text-white py-12">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="inline-block bg-primary text-xs font-mono px-2 py-1 rounded mb-4 tracking-wider uppercase">통관/관세 서비스</div>
          <h1 className="text-4xl font-bold mb-3">
            K-Beauty 통관, <span className="text-accent">TradeKR이 대행</span>합니다
          </h1>
          <p className="text-[#ccc] max-w-xl leading-relaxed">
            화장품 HS코드 분류부터 FTA 원산지증명, 기능성화장품 서류까지. 전문 관세사와 협업하여 최적의 세율을 적용합니다.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-4 divide-x divide-white/20">
          {[
            { label: "연간 통관 처리", value: "48,000건" },
            { label: "FTA 활용률", value: "82%" },
            { label: "평균 관세 절감", value: "₩8천만/년" },
            { label: "통관 거부율", value: "0.1% 미만" },
          ].map((s) => (
            <div key={s.label} className="py-4 text-center">
              <div className="font-bold text-2xl font-mono">{s.value}</div>
              <div className="text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-12">

        {/* HS Code Lookup */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-2">화장품 HS 코드 조회</h2>
          <p className="text-muted-foreground mb-6">K-Beauty 품목별 HS코드와 FTA 적용 관세율을 빠르게 확인하세요</p>
          <div className="flex items-center border-2 border-primary rounded overflow-hidden max-w-xl mb-4">
            <Search size={16} className="ml-3 text-muted-foreground" />
            <input
              type="text"
              value={hsSearch}
              onChange={(e) => setHsSearch(e.target.value)}
              placeholder="예: 에센스, 3304, 스킨케어..."
              className="flex-1 px-3 py-2.5 text-sm outline-none"
            />
            <button className="bg-primary text-white px-5 py-2.5 text-sm font-semibold">조회</button>
          </div>
          <div className="bg-white border border-border rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium">HS 코드</th>
                  <th className="px-4 py-3 text-left font-medium">품목 설명</th>
                  <th className="px-4 py-3 text-left font-medium">카테고리</th>
                  <th className="px-4 py-3 text-right font-medium">기본 관세율</th>
                  <th className="px-5 py-3 text-right font-medium">FTA 적용 세율</th>
                </tr>
              </thead>
              <tbody>
                {filteredHs.map((h, i) => (
                  <tr key={h.code} className={`border-t border-border hover:bg-secondary transition-colors ${i % 2 === 0 ? "" : "bg-[#fafafa]"}`}>
                    <td className="px-5 py-3 font-mono font-bold text-primary">{h.code}</td>
                    <td className="px-4 py-3 font-medium text-foreground">{h.desc}</td>
                    <td className="px-4 py-3">
                      <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded">{h.category}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-muted-foreground">{h.baseRate}</td>
                    <td className="px-5 py-3 text-right">
                      <span className="font-mono text-green-600 font-semibold">{h.ftaRate}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Duty Calculator + FTA */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          {/* Calculator */}
          <section className="bg-white border border-border rounded p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">관세 절감 계산기</h2>
            <p className="text-sm text-muted-foreground mb-5">FTA 적용 시 K-Beauty 수출 절감 효과를 미리 확인해보세요</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">물품 과세가격 (USD)</label>
                <input
                  type="number"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(e.target.value)}
                  placeholder="예: 50000"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">기본 관세율 (%) — 화장품 기본 6.5%</label>
                <input
                  type="number"
                  value={dutyRate}
                  onChange={(e) => setDutyRate(e.target.value)}
                  placeholder="예: 6.5"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5">FTA 협정 선택</label>
                <select
                  value={selectedFta}
                  onChange={(e) => setSelectedFta(e.target.value)}
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary bg-white"
                >
                  <option value="">FTA 미적용</option>
                  <option value="cn">한-중 FTA (화장품 0%)</option>
                  <option value="eu">한-EU FTA (화장품 0%)</option>
                  <option value="us">한-미국 FTA (화장품 0%)</option>
                  <option value="vn">한-베트남 FTA (화장품 0%)</option>
                  <option value="asean">한-ASEAN FTA</option>
                </select>
              </div>
            </div>
            {amount > 0 && (
              <div className="mt-5 bg-muted rounded p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">기본 관세</span>
                  <span className="font-mono">${normalDuty.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">FTA 적용 관세</span>
                  <span className="font-mono text-green-600">${ftaDuty.toFixed(0)}</span>
                </div>
                <div className="border-t border-[#e0e0e0] pt-2 flex justify-between font-bold">
                  <span className="text-primary flex items-center gap-1"><TrendingDown size={14} />절감액</span>
                  <span className="font-mono text-primary">${saving.toFixed(0)}</span>
                </div>
              </div>
            )}
          </section>

          {/* Required Documents */}
          <section className="bg-white border border-border rounded p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">K-Beauty 수출 필요 서류</h2>
            <p className="text-sm text-muted-foreground mb-5">화장품 수출 기준 — TradeKR이 전 서류 작성 대행</p>
            <div className="space-y-3">
              {requiredDocs.map((doc) => (
                <div key={doc.doc} className="flex items-start gap-3">
                  <div className={`mt-0.5 flex-shrink-0 ${doc.required ? "text-primary" : "text-[#bbb]"}`}>
                    {doc.required ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">{doc.doc}</div>
                    <div className="text-xs text-muted-foreground">{doc.note}</div>
                  </div>
                  <span className={`ml-auto text-[10px] px-2 py-0.5 rounded flex-shrink-0 ${doc.required ? "bg-red-50 text-red-600 border border-red-200" : "bg-muted text-muted-foreground"}`}>
                    {doc.required ? "필수" : "조건부"}
                  </span>
                </div>
              ))}
            </div>
            <button className="mt-5 w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2">
              서류 대행 신청 <ArrowRight size={16} />
            </button>
          </section>
        </div>

        {/* FTA Table */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-2">한국 FTA 현황 (화장품 중심)</h2>
          <p className="text-muted-foreground mb-6">K-Beauty 수출에 활용되는 주요 FTA 협정국</p>
          <div className="grid grid-cols-3 gap-4">
            {ftaAgreements.map((fta) => (
              <div key={fta.partner} className="bg-white border border-border rounded p-5 hover:border-primary transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{fta.flag}</span>
                  <div>
                    <div className="font-semibold text-foreground">{fta.partner}</div>
                    <div className="text-xs text-muted-foreground">발효 {fta.signed}년</div>
                  </div>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">적용 품목</span>
                    <span className="font-medium text-muted-foreground">{fta.coverage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">평균 절감</span>
                    <span className="font-medium text-green-600">{fta.saving}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
