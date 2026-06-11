import { useState } from "react";
import { Link } from "react-router";
import {
  Trash2, Plus, Minus, ShoppingCart, ArrowRight, Package,
  AlertCircle, Check, FlaskConical,
} from "lucide-react";

// ── 타입 ──────────────────────────────────────────────────────────────
type CartItem = {
  id: number;
  name: string;
  supplier: string;
  price: number;
  samplePrice: number;
  currency: string;
  moq: number;
  quantity: number;
  sampleQty: number;
  image: string;
  approved: boolean;
  hasSample: boolean;
  sampleOrdered: boolean;
};

type CartTab = "BULK" | "SAMPLE";

// ── 더미 데이터 ────────────────────────────────────────────────────────
const initialItems: CartItem[] = [
  {
    id: 1, name: "여성 베이직 오버핏 셔츠", supplier: "라온어패럴",
    price: 18900, samplePrice: 28000, currency: "₩", moq: 50,
    quantity: 50, sampleQty: 1,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=80&h=80&fit=crop&auto=format",
    approved: true, hasSample: true, sampleOrdered: false,
  },
  {
    id: 2, name: "여성 와이드 슬랙스", supplier: "모던클로젯",
    price: 24500, samplePrice: 35000, currency: "₩", moq: 30,
    quantity: 30, sampleQty: 1,
    image: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=80&h=80&fit=crop&auto=format",
    approved: true, hasSample: true, sampleOrdered: false,
  },
  {
    id: 3, name: "여성 봄 니트 가디건", supplier: "데일리앤코",
    price: 16200, samplePrice: 24000, currency: "₩", moq: 40,
    quantity: 20, sampleQty: 1,
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&h=80&fit=crop&auto=format",
    approved: false, hasSample: true, sampleOrdered: false,
  },
  {
    id: 4, name: "플로럴 랩 원피스", supplier: "모아뜨",
    price: 25000, samplePrice: 0, currency: "₩", moq: 20,
    quantity: 20, sampleQty: 0,
    image: "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=80&h=80&fit=crop&auto=format",
    approved: true, hasSample: false, sampleOrdered: false,
  },
];

export function Cart() {
  const [items,          setItems]          = useState<CartItem[]>(initialItems);
  const [tab,            setTab]            = useState<CartTab>("BULK");
  const [selected,       setSelected]       = useState<number[]>(initialItems.filter((i) => i.approved).map((i) => i.id));
  const [selectedSample, setSelectedSample] = useState<number[]>([]);

  // ── 수량 조정 ──────────────────────────────────────────────────────
  const updateQty = (id: number, delta: number, type: "bulk" | "sample") => {
    setItems(items.map((item) => {
      if (item.id !== id) return item;
      if (type === "bulk") {
        const next = item.quantity + delta;
        return next < item.moq ? item : { ...item, quantity: next };
      }
      const next = item.sampleQty + delta;
      return next < 1 || next > 5 ? item : { ...item, sampleQty: next };
    }));
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
    setSelected(selected.filter((s) => s !== id));
    setSelectedSample(selectedSample.filter((s) => s !== id));
  };

  // ── 샘플 토글 ──────────────────────────────────────────────────────
  const toggleSampleOrdered = (id: number) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const next = !item.sampleOrdered;
    setItems(items.map((i) => i.id === id ? { ...i, sampleOrdered: next } : i));
    if (next && item.approved) {
      setSelectedSample((p) => [...p, id]);
    } else {
      setSelectedSample((p) => p.filter((s) => s !== id));
    }
  };

  // ── 선택 ──────────────────────────────────────────────────────────
  const toggleSelect = (id: number, type: CartTab) => {
    if (type === "BULK") {
      setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
    } else {
      setSelectedSample((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);
    }
  };

  const toggleSelectAll = (type: CartTab) => {
    if (type === "BULK") {
      const ids = items.filter((i) => i.approved).map((i) => i.id);
      setSelected(selected.length === ids.length ? [] : ids);
    } else {
      const ids = sampleItems.filter((i) => i.approved).map((i) => i.id);
      setSelectedSample(selectedSample.length === ids.length ? [] : ids);
    }
  };

  // ── 파생 데이터 ────────────────────────────────────────────────────
  const sampleItems    = items.filter((i) => i.hasSample && i.sampleOrdered);
  const bulkSelected   = items.filter((i) => selected.includes(i.id));
  const sampleSelected = sampleItems.filter((i) => selectedSample.includes(i.id));
  const bulkSubtotal   = bulkSelected.reduce((a, i) => a + i.price * i.quantity, 0);
  const sampleSubtotal = sampleSelected.reduce((a, i) => a + i.samplePrice * i.sampleQty, 0);
  const bulkValidIds   = items.filter((i) => i.approved).map((i) => i.id);
  const sampleValidIds = sampleItems.filter((i) => i.approved).map((i) => i.id);
  const allBulkSel     = bulkValidIds.length > 0 && selected.length === bulkValidIds.length;
  const allSampleSel   = sampleValidIds.length > 0 && selectedSample.length === sampleValidIds.length;

  // ── 체크박스 공통 ──────────────────────────────────────────────────
  const Checkbox = ({
    checked, onClick, disabled = false, amber = false,
  }: { checked: boolean; onClick: () => void; disabled?: boolean; amber?: boolean }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 transition-colors ${
        disabled ? "border-muted bg-muted cursor-not-allowed"
        : checked
          ? amber ? "bg-amber-500 border-amber-500" : "bg-[#C4956A] border-[#C4956A]"
          : "border-muted-foreground hover:border-foreground"
      }`}
    >
      {checked && !disabled && <Check size={13} className="text-white" />}
    </button>
  );

  // ── 일반 구매 탭 ──────────────────────────────────────────────────
  const renderBulk = () => (
    <div className="space-y-4">
      <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3">
        <Checkbox checked={allBulkSel} onClick={() => toggleSelectAll("BULK")} />
        <span className="text-sm font-medium text-foreground">
          전체 선택 ({selected.length}/{bulkValidIds.length})
        </span>
      </div>

      {items.map((item) => {
        const moqShortfall = item.quantity < item.moq;
        const isSelected   = selected.includes(item.id);
        return (
          <div key={item.id} className={`bg-white border rounded-lg overflow-hidden ${moqShortfall ? "border-amber-300" : "border-border"}`}>
            <div className="flex items-start gap-4 p-5">
              <div className="mt-7">
                <Checkbox checked={isSelected} onClick={() => item.approved && toggleSelect(item.id, "BULK")} disabled={!item.approved} />
              </div>
              <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                    <div className="text-xs text-muted-foreground mt-0.5">{item.supplier}</div>
                    {!item.approved && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 w-fit">
                        <AlertCircle size={11} /> 판매자 승인 대기 중
                      </div>
                    )}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <div className="text-[#C4956A] font-bold text-sm">{item.currency}{item.price.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">최소 {item.moq.toLocaleString()}장</div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(item.id, -10, "bulk")} className="w-7 h-7 border border-border rounded flex items-center justify-center hover:border-[#C4956A] hover:text-[#C4956A] transition-colors"><Minus size={12} /></button>
                    <span className="font-mono text-sm w-20 text-center border border-border rounded px-2 py-1">{item.quantity.toLocaleString()}</span>
                    <button onClick={() => updateQty(item.id, 10, "bulk")} className="w-7 h-7 border border-border rounded flex items-center justify-center hover:border-[#C4956A] hover:text-[#C4956A] transition-colors"><Plus size={12} /></button>
                    <span className="text-xs text-muted-foreground">장</span>
                  </div>
                  <div className="font-bold text-foreground font-mono text-sm">{item.currency}{(item.price * item.quantity).toLocaleString()}</div>
                </div>

                {moqShortfall && (
                  <div className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                    <AlertCircle size={11} /> 최소 {item.moq.toLocaleString()}장 이상 주문해야 합니다
                  </div>
                )}

                {/* 샘플 주문 추가 버튼 */}
                {item.hasSample && (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <button
                      onClick={() => toggleSampleOrdered(item.id)}
                      className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                        item.sampleOrdered
                          ? "bg-amber-50 border-amber-300 text-amber-700"
                          : "border-border text-muted-foreground hover:border-amber-300 hover:text-amber-600"
                      }`}
                    >
                      <FlaskConical size={12} />
                      {item.sampleOrdered
                        ? `✓ 샘플 주문 추가됨 · ₩${item.samplePrice.toLocaleString()}/장`
                        : `샘플 먼저 받아보기 · ₩${item.samplePrice.toLocaleString()}/장`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── 샘플 주문 탭 ──────────────────────────────────────────────────
  const renderSample = () => (
    <div className="space-y-4">
      {sampleItems.length === 0 ? (
        <div className="bg-white border border-border rounded-lg py-16 text-center">
          <FlaskConical size={36} className="mx-auto text-muted-foreground mb-3 opacity-30" />
          <div className="font-medium text-foreground mb-1">샘플 주문 상품이 없습니다</div>
          <div className="text-sm text-muted-foreground mb-4">일반 구매 탭에서 "샘플 먼저 받아보기" 버튼을 눌러 추가하세요</div>
          <button onClick={() => setTab("BULK")} className="text-xs border border-[#C4956A] text-[#C4956A] hover:bg-rose-50 px-4 py-2 rounded-lg transition-colors">
            일반 구매 탭으로 이동
          </button>
        </div>
      ) : (
        <>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 leading-relaxed">
            <div className="font-semibold mb-1 flex items-center gap-1.5"><FlaskConical size={12} /> 샘플 주문 안내</div>
            본 발주 전 품질·색상·사이즈를 직접 확인하는 용도입니다. 수령 후 본생산 확정, 재협상, 또는 취소를 선택할 수 있습니다.
          </div>

          <div className="bg-white border border-border rounded-lg p-3 flex items-center gap-3">
            <Checkbox checked={allSampleSel} onClick={() => toggleSelectAll("SAMPLE")} amber />
            <span className="text-sm font-medium text-foreground">전체 선택 ({selectedSample.length}/{sampleValidIds.length})</span>
          </div>

          {sampleItems.map((item) => {
            const isSelected = selectedSample.includes(item.id);
            return (
              <div key={item.id} className="bg-white border border-amber-200 rounded-lg overflow-hidden">
                <div className="bg-amber-50/60 px-5 py-2 flex items-center gap-2 border-b border-amber-100">
                  <FlaskConical size={12} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">샘플 주문</span>
                  <span className="text-xs text-amber-500 ml-auto">최대 5장까지 주문 가능</span>
                </div>

                <div className="flex items-start gap-4 p-5">
                  <div className="mt-7">
                    <Checkbox checked={isSelected} onClick={() => item.approved && toggleSelect(item.id, "SAMPLE")} disabled={!item.approved} amber />
                  </div>
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm">{item.name}</h3>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.supplier}</div>
                      </div>
                      <button onClick={() => toggleSampleOrdered(item.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 mt-3">
                      <div className="text-amber-600 font-bold text-sm">
                        {item.currency}{item.samplePrice.toLocaleString()}
                        <span className="text-xs font-normal text-muted-foreground ml-1">/ 장 (샘플가)</span>
                      </div>
                      <div className="text-xs text-muted-foreground line-through">{item.currency}{item.price.toLocaleString()} 도매가</div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1, "sample")} className="w-7 h-7 border border-border rounded flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-colors"><Minus size={12} /></button>
                        <span className="font-mono text-sm w-16 text-center border border-border rounded px-2 py-1">{item.sampleQty}</span>
                        <button onClick={() => updateQty(item.id, 1, "sample")} className="w-7 h-7 border border-border rounded flex items-center justify-center hover:border-amber-400 hover:text-amber-600 transition-colors"><Plus size={12} /></button>
                        <span className="text-xs text-muted-foreground">장 (최대 5)</span>
                      </div>
                      <div className="font-bold text-foreground font-mono text-sm">{item.currency}{(item.samplePrice * item.sampleQty).toLocaleString()}</div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg">
                      본 발주 예정: {item.quantity.toLocaleString()}장 · {item.currency}{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  // ── 주문 요약 사이드바 ────────────────────────────────────────────
  const renderSummary = () => {
    const isSample     = tab === "SAMPLE";
    const currentItems = isSample ? sampleSelected : bulkSelected;
    const subtotal     = isSample ? sampleSubtotal : bulkSubtotal;

    return (
      <div className="space-y-4 sticky top-6">
        <div className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-bold text-foreground mb-1 flex items-center gap-2">
            {isSample && <FlaskConical size={16} className="text-amber-500" />}
            {isSample ? "샘플 주문 요약" : "주문 요약"}
          </h2>
          {isSample && <p className="text-xs text-muted-foreground mb-3">본 발주와 별도로 결제됩니다</p>}

          <div className="space-y-3 text-sm mt-4">
            <div className="flex justify-between text-muted-foreground">
              <span>{isSample ? "샘플" : "선택"} 상품 ({currentItems.length}개)</span>
              <span className="font-mono">₩{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>배송비</span>
              <span className="font-mono">착불</span>
            </div>
            {isSample && subtotal > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded px-3 py-2 text-xs text-amber-700">
                💡 본 발주 진행 시 샘플 비용 일부 환급 가능 (공급사 정책에 따라 상이)
              </div>
            )}
            <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground">
              <span>결제 예정액</span>
              <span className={`font-mono text-base ${isSample ? "text-amber-600" : "text-[#C4956A]"}`}>
                ₩{subtotal.toLocaleString()}
              </span>
            </div>
          </div>

          {currentItems.length === 0 ? (
            <button disabled className="mt-5 w-full py-3 rounded-lg font-semibold text-sm bg-muted text-muted-foreground cursor-not-allowed flex items-center justify-center gap-2">
              {isSample ? "샘플 주문하기" : "주문하기"} (0) <ArrowRight size={16} />
            </button>
          ) : (
            <Link
              to={isSample ? "/checkout?type=sample" : "/checkout"}
              className={`mt-5 w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                isSample ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[#C4956A] hover:bg-[#b3845a] text-white"
              }`}
            >
              {isSample ? "샘플 주문하기" : "주문하기"} ({currentItems.length}) <ArrowRight size={16} />
            </Link>
          )}

          <Link to="/products" className="mt-2 w-full border border-border text-muted-foreground hover:border-[#C4956A] hover:text-[#C4956A] py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
            쇼핑 계속하기
          </Link>
        </div>

        <div className={`border rounded-lg p-4 text-xs leading-relaxed ${isSample ? "bg-amber-50/50 border-amber-200 text-amber-800" : "bg-[#FAF9F7] border-[#C4956A]/20 text-muted-foreground"}`}>
          <div className="font-semibold mb-1.5">{isSample ? "🧪 샘플 주문 프로세스" : "🔒 안전결제 안내"}</div>
          {isSample
            ? "샘플 결제 → 공급사 발송 → 수령 후 검토 → 본생산 확정 또는 재협상 또는 취소"
            : "결제 대금은 안전하게 보관되며, 거래 완료 확인 후 판매자에게 정산됩니다."}
        </div>
      </div>
    );
  };

  // ── 빈 장바구니 ──────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
        <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <ShoppingCart size={24} className="text-[#C4956A]" /> 장바구니
        </h1>
        <div className="text-center py-20">
          <Package size={48} className="mx-auto text-muted-foreground mb-4 opacity-30" />
          <div className="font-semibold text-foreground mb-2">장바구니가 비어 있습니다</div>
          <div className="text-sm text-muted-foreground mb-6">도매 의류 상품을 탐색하고 담아보세요</div>
          <Link to="/products" className="bg-[#C4956A] hover:bg-[#b3845a] text-white px-8 py-3 rounded-lg font-semibold text-sm transition-colors inline-block">상품 탐색하기</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <ShoppingCart size={24} className="text-[#C4956A]" /> 장바구니
      </h1>

      {/* 탭 */}
      <div className="flex gap-0 mb-5 border border-border rounded-lg overflow-hidden w-fit">
        <button
          onClick={() => setTab("BULK")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
            tab === "BULK" ? "bg-[#C4956A] text-white" : "bg-white text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShoppingCart size={15} />
          일반 구매
          <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === "BULK" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}>
            {items.length}
          </span>
        </button>
        <button
          onClick={() => setTab("SAMPLE")}
          className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors border-l border-border ${
            tab === "SAMPLE" ? "bg-amber-500 text-white" : "bg-white text-muted-foreground hover:text-foreground"
          }`}
        >
          <FlaskConical size={15} />
          샘플 주문
          {sampleItems.length > 0 && (
            <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${tab === "SAMPLE" ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"}`}>
              {sampleItems.length}
            </span>
          )}
        </button>
      </div>

      {/* 샘플 추가됨 알림 배너 (일반 탭에서) */}
      {tab === "BULK" && sampleItems.length > 0 && (
        <div onClick={() => setTab("SAMPLE")} className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:bg-amber-100 transition-colors">
          <FlaskConical size={14} className="text-amber-600 flex-shrink-0" />
          <span className="text-xs text-amber-700 font-medium">샘플 주문 {sampleItems.length}개가 담겨 있습니다 — 샘플 주문 탭에서 확인하세요</span>
          <ArrowRight size={13} className="text-amber-500 ml-auto" />
        </div>
      )}

      <div className="grid grid-cols-[1fr_340px] gap-6">
        <div>
          {tab === "BULK"   && renderBulk()}
          {tab === "SAMPLE" && renderSample()}
        </div>
        {renderSummary()}
      </div>
    </div>
  );
}