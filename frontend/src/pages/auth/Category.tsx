import { useState, useEffect } from "react";
import { Tag, Search } from "lucide-react";

export type Category = { id: string; name: string; group: string };

// TODO: 실제 API로 교체
async function fetchCategories(): Promise<Category[]> {
  await new Promise((r) => setTimeout(r, 700));
  return [
    { id: "top-tshirt",   name: "티셔츠",        group: "상의" },
    { id: "top-shirt",    name: "셔츠/블라우스",  group: "상의" },
    { id: "top-knit",     name: "니트/스웨터",    group: "상의" },
    { id: "top-hood",     name: "후드/맨투맨",    group: "상의" },
    { id: "top-polo",     name: "폴로/카라",      group: "상의" },
    { id: "bot-jean",     name: "청바지",          group: "하의" },
    { id: "bot-slacks",   name: "슬랙스",          group: "하의" },
    { id: "bot-short",    name: "반바지",          group: "하의" },
    { id: "bot-skirt",    name: "치마",            group: "하의" },
    { id: "bot-legging",  name: "레깅스",          group: "하의" },
    { id: "out-jacket",   name: "자켓",            group: "아우터" },
    { id: "out-coat",     name: "코트",            group: "아우터" },
    { id: "out-padding",  name: "패딩",            group: "아우터" },
    { id: "out-cardigan", name: "가디건",          group: "아우터" },
    { id: "out-blazer",   name: "블레이저",        group: "아우터" },
    { id: "dr-onepiece",  name: "원피스",          group: "원피스/세트" },
    { id: "dr-twopiece",  name: "투피스/세트",     group: "원피스/세트" },
    { id: "dr-jumpsuit",  name: "점프수트",        group: "원피스/세트" },
    { id: "sp-yoga",      name: "요가/필라테스",   group: "스포츠/레저" },
    { id: "sp-outdoor",   name: "아웃도어",        group: "스포츠/레저" },
    { id: "sp-golf",      name: "골프웨어",        group: "스포츠/레저" },
    { id: "acc-bag",      name: "가방",            group: "액세서리" },
    { id: "acc-shoes",    name: "신발",            group: "액세서리" },
    { id: "acc-hat",      name: "모자/벨트",       group: "액세서리" },
  ];
}

export function CategoryStep({
  selected,
  onChange,
  agreed,
  onAgreedChange,
  role,
}: {
  selected: string[];
  onChange: (ids: string[]) => void;
  agreed: boolean;
  onAgreedChange: (v: boolean) => void;
  role: "buyer" | "seller";
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories().then((data) => { setCategories(data); setLoading(false); });
  }, []);

  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);

  const groups = categories.reduce<Record<string, Category[]>>((acc, cat) => {
    const q = search.trim().toLowerCase();
    if (q && !cat.name.includes(q) && !cat.group.includes(q)) return acc;
    (acc[cat.group] ??= []).push(cat);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
        <Tag size={14} className="text-primary" /> 선호 카테고리
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        {role === "buyer"
          ? "주로 구매하는 카테고리를 선택하면 맞춤 상품을 우선 노출해 드립니다."
          : "주로 공급하는 카테고리를 선택하면 맞춤 바이어를 우선 매칭해 드립니다."}
        {" "}(복수 선택 가능)
      </p>

      {/* 검색 */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="카테고리 검색..."
          className="w-full border border-border rounded pl-8 pr-3 py-2 text-sm outline-none focus:border-primary transition-colors"
        />
      </div>

      {/* 카테고리 목록 */}
      {loading ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted-foreground">카테고리 불러오는 중...</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-56 overflow-y-auto pr-1 -mr-1">
          {Object.entries(groups).map(([group, cats]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {cats.map((cat) => {
                  const active = selected.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggle(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted-foreground border-border hover:border-primary/50 hover:text-primary"
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {Object.keys(groups).length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-6">검색 결과가 없습니다.</p>
          )}
        </div>
      )}

      {/* 선택 현황 */}
      {selected.length > 0 && (
        <div className="bg-secondary border border-primary/20 rounded p-3">
          <p className="text-xs font-semibold text-primary mb-1.5">
            선택된 카테고리 ({selected.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((id) => {
              const cat = categories.find((c) => c.id === id);
              return cat ? (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggle(id)}
                  className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors"
                >
                  {cat.name} ×
                </button>
              ) : null;
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        * 선택하지 않아도 가입 가능합니다. 가입 후 마이페이지에서 수정할 수 있습니다.
      </p>

      <hr className="border-border" />

      {/* 약관 동의 */}
      <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
          className="mt-0.5 shrink-0"
        />
        <span>
          <a href="#" className="text-primary underline">이용약관</a> 및{" "}
          <a href="#" className="text-primary underline">개인정보 처리방침</a>에 동의합니다.
        </span>
      </label>
    </div>
  );
}
