import { useState } from "react";
import { Link } from "react-router";
import { Search, CheckCircle, Star, Filter, Globe, Plus } from "lucide-react";

const allSuppliers = [
  { name: "코스맥스(주)", country: "🇰🇷 한국", category: "OEM/ODM", products: 1240, years: 25, verified: true, rating: 5.0, moq: "500개", desc: "스킨케어·메이크업 OEM/ODM 전문. 전 세계 700여 브랜드 생산 파트너. ISO 22716 인증." },
  { name: "한국콜마(주)", country: "🇰🇷 한국", category: "기능성화장품", products: 980, years: 30, verified: true, rating: 4.9, moq: "500개", desc: "기능성 화장품·의약외품 OEM/ODM 전문. FDA, CE, KFDA 인증 보유." },
  { name: "메디힐(주)", country: "🇰🇷 한국", category: "마스크팩", products: 320, years: 12, verified: true, rating: 4.9, moq: "5,000개", desc: "기능성 마스크팩 1위 브랜드. 앰플·스킨케어 전문. 80개국 수출 이력." },
  { name: "JMsolution Korea", country: "🇰🇷 한국", category: "스킨케어", products: 210, years: 8, verified: true, rating: 4.8, moq: "1,000개", desc: "천연성분 스킨케어·마스크팩 전문. 히알루론산, 골드 라인 특화." },
  { name: "에스트라(주)", country: "🇰🇷 한국", category: "더마코스메틱", products: 180, years: 15, verified: true, rating: 4.8, moq: "300개", desc: "더마 기반 민감성 피부 전문 브랜드. 아토베리어·선스크린 라인 강점." },
  { name: "토니모리(주)", country: "🇰🇷 한국", category: "스킨케어/메이크업", products: 450, years: 14, verified: true, rating: 4.7, moq: "500개", desc: "자연성분 기반 스킨케어·메이크업 전문. 귀엽고 트렌디한 패키지로 Z세대 인기." },
  { name: "클리오코스메틱(주)", country: "🇰🇷 한국", category: "메이크업", products: 290, years: 18, verified: true, rating: 4.7, moq: "300개", desc: "트렌디한 메이크업 전문 브랜드. 파운데이션·립·아이 제품 강점." },
  { name: "코웨이뷰티(주)", country: "🇰🇷 한국", category: "기능성화장품", products: 120, years: 10, verified: false, rating: 4.4, moq: "1,000개", desc: "항산화·안티에이징 기능성 화장품 전문. 특허 성분 보유." },
  { name: "Nature Republic", country: "🇰🇷 한국", category: "바디케어/스킨케어", products: 380, years: 16, verified: true, rating: 4.6, moq: "500개", desc: "알로에베라·자연 성분 기반 스킨케어·바디케어. 친환경 포장재 사용." },
];

const categories = ["전체", "스킨케어", "메이크업", "마스크팩", "기능성화장품", "더마코스메틱", "바디케어/스킨케어", "OEM/ODM", "스킨케어/메이크업"];
const countries = ["전체 국가", "한국", "일본", "대만", "중국"];

export function Suppliers() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("전체");
  const [activeCountry, setActiveCountry] = useState("전체 국가");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filtered = allSuppliers.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.desc.includes(search);
    const matchCat = activeCategory === "전체" || s.category === activeCategory;
    const matchCountry = activeCountry === "전체 국가" || s.country.includes(activeCountry);
    const matchVerified = !verifiedOnly || s.verified;
    return matchSearch && matchCat && matchCountry && matchVerified;
  });

  return (
    <div className="font-[Inter,sans-serif]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#2d1a2e] to-[#1a0e2e] text-white py-12">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="inline-block bg-primary text-xs font-mono px-2 py-1 rounded mb-4 tracking-wider uppercase">공급업체 디렉토리</div>
          <h1 className="text-4xl font-bold mb-3">K-Beauty 인증 공급업체 <span className="text-accent">3,800+</span></h1>
          <p className="text-[#ccc] mb-6">현장 실사 및 서류 검증을 완료한 신뢰할 수 있는 K-Beauty 공급업체를 직접 탐색하세요.</p>
          <Link
            to="/supplier-register"
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded font-semibold text-sm transition-colors"
          >
            <Plus size={16} /> 공급업체 등록 신청
          </Link>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white border border-border rounded p-5 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="flex items-center border border-border rounded px-3 py-2 gap-2 flex-1 min-w-[240px]">
              <Search size={15} className="text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="업체명, 제품 키워드 검색..."
                className="text-sm outline-none flex-1"
              />
            </div>

            {/* Country */}
            <select
              value={activeCountry}
              onChange={(e) => setActiveCountry(e.target.value)}
              className="border border-border rounded px-3 py-2 text-sm outline-none bg-white focus:border-primary"
            >
              {countries.map((c) => <option key={c}>{c}</option>)}
            </select>

            {/* Verified toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
              <div
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${verifiedOnly ? "bg-primary" : "bg-[#ddd]"}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${verifiedOnly ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              인증 업체만
            </label>

            <div className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <Filter size={12} />
              {filtered.length}개 업체
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs rounded border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Supplier Cards */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div key={s.name} className="bg-white border border-border rounded overflow-hidden hover:border-primary hover:shadow-md transition-all cursor-pointer group">
              <div className="h-2 bg-gradient-to-r from-primary to-accent" />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <Globe size={11} />
                      {s.country}
                    </div>
                  </div>
                  {s.verified && (
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-green-200">
                      <CheckCircle size={10} />
                      인증
                    </div>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.desc}</p>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  <div className="bg-muted rounded p-2">
                    <div className="font-mono font-bold text-sm text-foreground">{s.products.toLocaleString()}</div>
                    <div className="text-[10px] text-muted-foreground">제품수</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="font-mono font-bold text-sm text-foreground">{s.years}년</div>
                    <div className="text-[10px] text-muted-foreground">업력</div>
                  </div>
                  <div className="bg-muted rounded p-2">
                    <div className="font-mono font-bold text-sm text-primary flex items-center justify-center gap-0.5">
                      <Star size={11} fill="currentColor" className="text-accent" />
                      {s.rating}
                    </div>
                    <div className="text-[10px] text-muted-foreground">평점</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs bg-secondary text-primary px-2 py-0.5 rounded">{s.category}</span>
                  <span className="text-xs text-muted-foreground">최소 {s.moq}</span>
                </div>

                <Link to="/product/1" className="mt-4 w-full border border-primary text-primary hover:bg-primary hover:text-white text-sm py-2 rounded font-medium transition-colors block text-center">
                  업체 상세보기
                </Link>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="text-4xl mb-3">🔍</div>
            <div className="font-medium">검색 결과가 없습니다</div>
            <div className="text-sm mt-1">다른 키워드나 필터를 사용해보세요</div>
          </div>
        )}
      </div>
    </div>
  );
}
