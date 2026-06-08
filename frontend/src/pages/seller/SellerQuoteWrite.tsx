import { useState } from "react";
import { Link, useParams } from "react-router";
import {
  ChevronLeft,
  FileText,
  CheckCircle,
  Package,
  Truck,
  Calendar,
  AlertCircle,
  Plus,
  X,
  Info,
  Clock,
} from "lucide-react";

const CATEGORIES = ["상의", "하의", "원피스/세트", "아우터", "이너웨어", "액세서리"];
const SHIPPING_COMPANIES = ["CJ대한통운", "롯데택배", "한진택배", "로젠택배", "우체국택배", "직접 발송"];
const LEAD_TIME_OPTIONS = ["당일 출고", "1~2일", "3~5일", "1주일 이내", "2주일 이내", "협의 필요"];

type SizeRow = { size: string; quantity: string; unitPrice: string };
type ColorRow = { color: string; sizes: SizeRow[] };

const DEFAULT_SIZES = ["S", "M", "L", "XL"];

function makeSizeRows(): SizeRow[] {
  return DEFAULT_SIZES.map((s) => ({ size: s, quantity: "", unitPrice: "" }));
}

export function SellerQuoteWrite() {
  const { requestId } = useParams<{ requestId: string }>();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    brandName: "",
    productName: "",
    category: "",
    material: "",
    origin: "",
    leadTime: "",
    shippingCompany: "",
    shippingFee: "",
    freeShippingThreshold: "",
    validDays: "7",
    sampleAvailable: false,
    samplePrice: "",
    notes: "",
    returnPolicy: "",
  });

  const [colors, setColors] = useState<ColorRow[]>([
    { color: "블랙", sizes: makeSizeRows() },
  ]);

  const update = (field: string, value: string | boolean) =>
    setForm((p) => ({ ...p, [field]: value }));

  const addColor = () =>
    setColors((p) => [...p, { color: "", sizes: makeSizeRows() }]);

  const removeColor = (ci: number) =>
    setColors((p) => p.filter((_, i) => i !== ci));

  const updateColorName = (ci: number, val: string) =>
    setColors((p) =>
      p.map((c, i) => (i === ci ? { ...c, color: val } : c))
    );

  const updateSize = (
    ci: number,
    si: number,
    field: keyof SizeRow,
    val: string
  ) =>
    setColors((p) =>
      p.map((c, i) =>
        i === ci
          ? {
              ...c,
              sizes: c.sizes.map((s, j) =>
                j === si ? { ...s, [field]: val } : s
              ),
            }
          : c
      )
    );

  const addSize = (ci: number) =>
    setColors((p) =>
      p.map((c, i) =>
        i === ci
          ? { ...c, sizes: [...c.sizes, { size: "", quantity: "", unitPrice: "" }] }
          : c
      )
    );

  const removeSize = (ci: number, si: number) =>
    setColors((p) =>
      p.map((c, i) =>
        i === ci ? { ...c, sizes: c.sizes.filter((_, j) => j !== si) } : c
      )
    );

  const totalQuantity = colors.reduce(
    (sum, c) =>
      sum +
      c.sizes.reduce((s2, sz) => s2 + (parseInt(sz.quantity) || 0), 0),
    0
  );

  const calcTotal = () => {
    let total = 0;
    colors.forEach((c) => {
      c.sizes.forEach((sz) => {
        const qty = parseInt(sz.quantity) || 0;
        const price = parseInt(sz.unitPrice) || 0;
        total += qty * price;
      });
    });
    return total;
  };

  const totalAmount = calcTotal();
  const shippingFeeNum = parseInt(form.shippingFee) || 0;
  const freeThreshold = parseInt(form.freeShippingThreshold) || 0;
  const isShippingFree = freeThreshold > 0 && totalAmount >= freeThreshold;
  const finalTotal = totalAmount + (isShippingFree ? 0 : shippingFeeNum);

  if (submitted) {
    return (
      <div className="max-w-[640px] mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-border rounded-lg p-10">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={36} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-3">
            견적서가 제출되었습니다
          </h2>
          <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
            바이어에게 견적서가 전달되었습니다.
          </p>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            바이어가 견적을 검토한 후 채택 여부를 알림으로 안내드립니다.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 mb-8 text-left flex gap-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>
              채택 확정 후에는 견적 내용(단가·택배비 등)을 수정할 수 없습니다.
              신중하게 작성해 주세요.
            </span>
          </div>
          <div className="flex justify-center gap-3">
            <Link
              to="/seller"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded font-semibold text-sm transition-colors"
            >
              셀러 대시보드로
            </Link>
            <button
              onClick={() => setSubmitted(false)}
              className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-2.5 rounded text-sm font-medium transition-colors"
            >
              다른 요청 확인
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/seller/sourcing-requests"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft size={16} />
          소싱 요청 목록으로
        </Link>
        <div className="bg-gradient-to-r from-[#1a2e1a] to-[#2d4a35] text-white rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText size={26} />
            <h1 className="text-2xl font-bold">견적서 작성</h1>
          </div>
          <p className="text-sm text-white/70">
            소싱 요청 번호{" "}
            <span className="text-white font-medium">
              {requestId ?? "SRC-2024-0142"}
            </span>
            에 대한 견적서를 작성합니다.
          </p>
        </div>
      </div>

      {/* 요청 내용 요약 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info size={15} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">
            바이어 소싱 요청 내용
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-blue-500 text-xs mb-0.5">카테고리</p>
            <p className="text-blue-900 font-medium">상의 (블라우스)</p>
          </div>
          <div>
            <p className="text-blue-500 text-xs mb-0.5">희망 수량</p>
            <p className="text-blue-900 font-medium">200벌 이상</p>
          </div>
          <div>
            <p className="text-blue-500 text-xs mb-0.5">희망 납기</p>
            <p className="text-blue-900 font-medium">7일 이내</p>
          </div>
          <div>
            <p className="text-blue-500 text-xs mb-0.5">희망 단가</p>
            <p className="text-blue-900 font-medium">₩15,000 이하</p>
          </div>
        </div>
        <p className="text-xs text-blue-700 mt-3 border-t border-blue-200 pt-3">
          요청 메모: 린넨 소재 여름 블라우스, 화이트·베이지 컬러 선호, 샘플 먼저 확인 희망
        </p>
      </div>

      <div className="space-y-5">
        {/* 상품 기본 정보 */}
        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package size={15} className="text-primary" />
            상품 기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                브랜드명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.brandName}
                onChange={(e) => update("brandName", e.target.value)}
                placeholder="예: 르블랑"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                상품명 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                placeholder="예: 여성 린넨 오버핏 블라우스"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                카테고리 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">선택</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                소재
              </label>
              <input
                type="text"
                value={form.material}
                onChange={(e) => update("material", e.target.value)}
                placeholder="예: 린넨 100%, 면 80% 폴리 20%"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                원산지
              </label>
              <input
                type="text"
                value={form.origin}
                onChange={(e) => update("origin", e.target.value)}
                placeholder="예: 국내산, 중국산"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                평균 출고 소요일 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.leadTime}
                onChange={(e) => update("leadTime", e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">선택</option>
                {LEAD_TIME_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* 컬러·사이즈별 수량 및 단가 */}
        <section className="bg-white border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package size={15} className="text-primary" />
              컬러 · 사이즈별 수량 및 단가
            </h2>
            <button
              onClick={addColor}
              className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 hover:bg-primary/5 px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={13} />
              컬러 추가
            </button>
          </div>

          <div className="space-y-5">
            {colors.map((color, ci) => (
              <div
                key={ci}
                className="border border-border rounded-lg p-4 bg-secondary/30"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      컬러명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={color.color}
                      onChange={(e) => updateColorName(ci, e.target.value)}
                      placeholder="예: 화이트, 베이지, 블랙"
                      className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                    />
                  </div>
                  {colors.length > 1 && (
                    <button
                      onClick={() => removeColor(ci)}
                      className="mt-5 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* 사이즈 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-3">
                          사이즈
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-3">
                          수량 (장/벌)
                        </th>
                        <th className="text-left text-xs font-medium text-muted-foreground pb-2 pr-3">
                          도매 단가 (₩)
                        </th>
                        <th className="pb-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {color.sizes.map((sz, si) => (
                        <tr key={si} className="border-b border-border/50 last:border-0">
                          <td className="py-2 pr-3">
                            <input
                              type="text"
                              value={sz.size}
                              onChange={(e) =>
                                updateSize(ci, si, "size", e.target.value)
                              }
                              placeholder="S"
                              className="w-20 border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              type="number"
                              value={sz.quantity}
                              onChange={(e) =>
                                updateSize(ci, si, "quantity", e.target.value)
                              }
                              placeholder="0"
                              min="0"
                              className="w-28 border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">₩</span>
                              <input
                                type="number"
                                value={sz.unitPrice}
                                onChange={(e) =>
                                  updateSize(ci, si, "unitPrice", e.target.value)
                                }
                                placeholder="0"
                                min="0"
                                className="w-28 border border-border rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary bg-white"
                              />
                            </div>
                          </td>
                          <td className="py-2">
                            {color.sizes.length > 1 && (
                              <button
                                onClick={() => removeSize(ci, si)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={() => addSize(ci)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus size={12} />
                  사이즈 추가
                </button>
              </div>
            ))}
          </div>

          {/* 수량 합계 */}
          {totalQuantity > 0 && (
            <div className="mt-4 flex items-center justify-between bg-secondary/50 rounded px-4 py-2.5 text-sm">
              <span className="text-muted-foreground">총 수량</span>
              <span className="font-semibold text-foreground">
                {totalQuantity.toLocaleString()}장
              </span>
            </div>
          )}
        </section>

        {/* 배송 정보 */}
        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck size={15} className="text-primary" />
            배송 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                택배사 <span className="text-red-500">*</span>
              </label>
              <select
                value={form.shippingCompany}
                onChange={(e) => update("shippingCompany", e.target.value)}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">선택</option>
                {SHIPPING_COMPANIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                기본 택배비 (₩) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">₩</span>
                <input
                  type="number"
                  value={form.shippingFee}
                  onChange={(e) => update("shippingFee", e.target.value)}
                  placeholder="3,000"
                  min="0"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                무료배송 기준 금액 (₩)
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">₩</span>
                <input
                  type="number"
                  value={form.freeShippingThreshold}
                  onChange={(e) =>
                    update("freeShippingThreshold", e.target.value)
                  }
                  placeholder="500,000 이상 무료"
                  min="0"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 견적 조건 */}
        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar size={15} className="text-primary" />
            견적 조건
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                견적 유효 기간
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={form.validDays}
                  onChange={(e) => update("validDays", e.target.value)}
                  className="flex-1 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                >
                  <option value="3">3일</option>
                  <option value="5">5일</option>
                  <option value="7">7일</option>
                  <option value="14">14일</option>
                  <option value="30">30일</option>
                </select>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  이내 채택 시 유효
                </span>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                샘플 제공
              </label>
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="sample"
                    checked={form.sampleAvailable}
                    onChange={() => update("sampleAvailable", true)}
                    className="accent-primary"
                  />
                  가능
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="sample"
                    checked={!form.sampleAvailable}
                    onChange={() => update("sampleAvailable", false)}
                    className="accent-primary"
                  />
                  불가
                </label>
              </div>
            </div>
            {form.sampleAvailable && (
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  샘플 단가 (₩)
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">₩</span>
                  <input
                    type="number"
                    value={form.samplePrice}
                    onChange={(e) => update("samplePrice", e.target.value)}
                    placeholder="무료 시 0 입력"
                    min="0"
                    className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 반품·교환 정책 및 메모 */}
        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText size={15} className="text-primary" />
            반품 · 교환 정책 및 메모
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                반품 · 교환 정책
              </label>
              <textarea
                value={form.returnPolicy}
                onChange={(e) => update("returnPolicy", e.target.value)}
                placeholder="예: 수령 후 7일 이내 불량 건에 한해 교환 가능, 단순 변심 반품 불가"
                rows={2}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                셀러 메모 (바이어에게 표시됨)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="예: 재고 한정 수량으로 빠른 채택 부탁드립니다. 대량 주문 시 추가 할인 협의 가능."
                rows={3}
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
              />
            </div>
          </div>
        </section>

        {/* 견적 요약 */}
        {totalAmount > 0 && (
          <section className="bg-white border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              견적 요약
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>상품 금액 합계</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  택배비
                  {isShippingFree && (
                    <span className="ml-1.5 text-xs text-green-600 font-medium">
                      무료배송 적용
                    </span>
                  )}
                </span>
                <span>
                  {isShippingFree
                    ? "₩0"
                    : shippingFeeNum > 0
                    ? `₩${shippingFeeNum.toLocaleString()}`
                    : "—"}
                </span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground text-base">
                <span>견적 총액</span>
                <span>₩{finalTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>총 수량</span>
                <span>{totalQuantity.toLocaleString()}장</span>
              </div>
              {form.leadTime && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>출고 소요일</span>
                  <span>{form.leadTime}</span>
                </div>
              )}
              {form.validDays && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>견적 유효 기간</span>
                  <span>{form.validDays}일</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 주의사항 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 space-y-1 leading-relaxed">
            <p className="font-semibold">제출 전 확인하세요</p>
            <p>
              견적서가 바이어에게 채택된 이후에는{" "}
              <strong>단가·택배비·수량 등 견적 내용을 수정할 수 없습니다.</strong>
            </p>
            <p>
              바이어는 여러 셀러의 견적을 비교하므로 정확하고 경쟁력 있는 조건으로
              작성해 주세요.
            </p>
            <p>
              견적서 내 외부 연락처(전화번호, SNS ID 등) 기재는 플랫폼 정책상
              금지되며, 적발 시 계정 경고 처리됩니다.
            </p>
          </div>
        </div>

        {/* 제출 버튼 */}
        <div className="flex gap-3 justify-end pb-8">
          <Link
            to="/seller/sourcing-requests"
            className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-2.5 rounded text-sm font-medium transition-colors"
          >
            취소
          </Link>
          <button
            onClick={() => setSubmitted(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded font-semibold text-sm transition-colors flex items-center gap-2"
          >
            <FileText size={15} />
            견적서 제출
          </button>
        </div>
      </div>
    </div>
  );
}
