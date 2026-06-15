import { useMemo, useState } from "react";
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

const DEFAULT_OPTION_VALUES = [
  { optionName: "색상", optionValue: "블랙" },
  { optionName: "사이즈", optionValue: "M" },
];

type QuoteOptionValueRow = {
  optionName: string;
  optionValue: string;
};

type QuoteItemRow = {
  optionValues: QuoteOptionValueRow[];
  quantity: string;
  unitPrice: string;
};

type SampleItemRow = {
  sampleName: string;
  quantity: string;
  unitPrice: string;
  memo: string;
};

type QuoteForm = {
  brandName: string;
  productName: string;
  categoryName: string;
  material: string;
  leadTimeDays: string;
  deliveryCompany: string;
  shippingFee: string;
  validDays: string;
  customValidDays: string; // 추가
  sampleAvailable: "AVAILABLE" | "UNAVAILABLE";
  sellerMemo: string;
};

function makeDefaultQuoteItem(): QuoteItemRow {
  return {
    optionValues: DEFAULT_OPTION_VALUES.map((option) => ({ ...option })),
    quantity: "",
    unitPrice: "",
  };
}

function makeDefaultSampleItem(): SampleItemRow {
  return {
    sampleName: "",
    quantity: "1",
    unitPrice: "",
    memo: "",
  };
}

function toNumber(value: string) {
  return Number(value.replaceAll(",", "")) || 0;
}

function formatPrice(value: number) {
  return `₩${value.toLocaleString()}`;
}

function buildOptionSummary(optionValues: QuoteOptionValueRow[]) {
  return optionValues
    .filter((option) => option.optionName.trim() || option.optionValue.trim())
    .map((option) => `${option.optionName.trim()}: ${option.optionValue.trim()}`)
    .join(" / ");
}

function buildSampleSummary(sampleItems: SampleItemRow[]) {
  const validSampleItems = sampleItems.filter(
    (sample) =>
      sample.sampleName.trim() ||
      toNumber(sample.quantity) > 0 ||
      toNumber(sample.unitPrice) > 0 ||
      sample.memo.trim()
  );

  if (validSampleItems.length === 0) {
    return "";
  }

  return validSampleItems
    .map((sample, index) => {
      const quantity = toNumber(sample.quantity);
      const unitPrice = toNumber(sample.unitPrice);
      const totalPrice = quantity * unitPrice;

      return [
        `샘플 ${index + 1}`,
        sample.sampleName.trim() && `샘플명: ${sample.sampleName.trim()}`,
        `수량: ${quantity}`,
        `단가: ${formatPrice(unitPrice)}`,
        `금액: ${formatPrice(totalPrice)}`,
        sample.memo.trim() && `메모: ${sample.memo.trim()}`,
      ]
        .filter(Boolean)
        .join(" / ");
    })
    .join("\n");
}

function getValidUntil(validDays: string) {
  const days = toNumber(validDays) || 7;
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + days);
  return validUntil.toISOString();
}

export function SellerQuoteWrite() {
  const { requestId } = useParams<{ requestId: string }>();
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState<QuoteForm>({
    brandName: "",
    productName: "",
    categoryName: "",
    material: "",
    leadTimeDays: "7",
    deliveryCompany: "",
    shippingFee: "0",
    validDays: "7",
    customValidDays: "",
    sampleAvailable: "AVAILABLE",
    sellerMemo: "",
  });

  const [quoteItems, setQuoteItems] = useState<QuoteItemRow[]>([
    makeDefaultQuoteItem(),
  ]);

  const [sampleItems, setSampleItems] = useState<SampleItemRow[]>([
    makeDefaultSampleItem(),
  ]);

  const updateForm = (field: keyof QuoteForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addQuoteItem = () => {
    setQuoteItems((prev) => [...prev, makeDefaultQuoteItem()]);
  };

  const removeQuoteItem = (itemIndex: number) => {
    setQuoteItems((prev) => prev.filter((_, index) => index !== itemIndex));
  };

  const updateQuoteItem = (
    itemIndex: number,
    field: "quantity" | "unitPrice",
    value: string
  ) => {
    setQuoteItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      )
    );
  };

  const addOptionValue = (itemIndex: number) => {
    setQuoteItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              optionValues: [
                ...item.optionValues,
                { optionName: "", optionValue: "" },
              ],
            }
          : item
      )
    );
  };

  const removeOptionValue = (itemIndex: number, optionIndex: number) => {
    setQuoteItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              optionValues: item.optionValues.filter(
                (_, currentIndex) => currentIndex !== optionIndex
              ),
            }
          : item
      )
    );
  };

  const updateOptionValue = (
    itemIndex: number,
    optionIndex: number,
    field: keyof QuoteOptionValueRow,
    value: string
  ) => {
    setQuoteItems((prev) =>
      prev.map((item, index) =>
        index === itemIndex
          ? {
              ...item,
              optionValues: item.optionValues.map((option, currentIndex) =>
                currentIndex === optionIndex
                  ? { ...option, [field]: value }
                  : option
              ),
            }
          : item
      )
    );
  };

  const addSampleItem = () => {
    setSampleItems((prev) => [...prev, makeDefaultSampleItem()]);
  };

  const removeSampleItem = (sampleIndex: number) => {
    setSampleItems((prev) => prev.filter((_, index) => index !== sampleIndex));
  };

  const updateSampleItem = (
    sampleIndex: number,
    field: keyof SampleItemRow,
    value: string
  ) => {
    setSampleItems((prev) =>
      prev.map((sample, index) =>
        index === sampleIndex ? { ...sample, [field]: value } : sample
      )
    );
  };

  const quoteItemSnapshots = useMemo(
    () =>
      quoteItems.map((item) => {
        const quantity = toNumber(item.quantity);
        const unitPrice = toNumber(item.unitPrice);
        const totalPrice = quantity * unitPrice;

        return {
          option_summary: buildOptionSummary(item.optionValues),
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
        };
      }),
    [quoteItems]
  );

  const sampleItemSnapshots = useMemo(
    () =>
      sampleItems.map((sample) => {
        const quantity = toNumber(sample.quantity);
        const unitPrice = toNumber(sample.unitPrice);
        const totalPrice = quantity * unitPrice;

        return {
          sample_name: sample.sampleName.trim(),
          quantity,
          unit_price: unitPrice,
          total_price: totalPrice,
          memo: sample.memo.trim(),
        };
      }),
    [sampleItems]
  );

  const totalQuantity = quoteItemSnapshots.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const subtotalAmount = quoteItemSnapshots.reduce(
    (sum, item) => sum + item.total_price,
    0
  );
  const shippingFee = toNumber(form.shippingFee);
  const totalAmount = subtotalAmount + shippingFee;

  const sampleTotalAmount =
    form.sampleAvailable === "AVAILABLE"
      ? sampleItemSnapshots.reduce((sum, item) => sum + item.total_price, 0)
      : 0;

  const sampleSummary =
    form.sampleAvailable === "AVAILABLE" ? buildSampleSummary(sampleItems) : "";

  const sellerMemoWithSample =
    sampleSummary.trim().length > 0
      ? `${form.sellerMemo}${form.sellerMemo.trim() ? "\n\n" : ""}[샘플 제공 조건]\n${sampleSummary}`
      : form.sellerMemo;

  const submitPayload = {
    // quotes
    sourcing_id: requestId,
    brand_name: form.brandName,
    product_name: form.productName,
    category_name: form.categoryName,
    material: form.material,
    lead_time_days: toNumber(form.leadTimeDays),
    delivery_company: form.deliveryCompany,
    shipping_fee: shippingFee,
    valid_until: getValidUntil(form.validDays),
    sample_available: form.sampleAvailable,
    seller_memo: sellerMemoWithSample,
    subtotal_amount: subtotalAmount,
    total_amount: totalAmount,
    status: "SUBMITTED",

    // quote_items
    quote_items: quoteItemSnapshots,

    // 현재 DBML에는 샘플 전용 테이블이 없어서 백엔드에서 seller_memo에 합쳐 저장하거나,
    // 추후 quote_sample_items 테이블 추가 시 이 배열을 그대로 분리 저장하면 됩니다.
    sample_items: form.sampleAvailable === "AVAILABLE" ? sampleItemSnapshots : [],
  };

  const handleSubmit = () => {
    console.log("견적서 제출 payload", submitPayload);
    setSubmitted(true);
  };

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
              채택 확정 후에는 견적 내용(단가·배송비·수량 등)을 수정할 수
              없습니다. 신중하게 작성해 주세요.
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
            <p className="text-blue-900 font-medium">상의</p>
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
        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package size={15} className="text-primary" />
            견적 상품 기본 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                브랜드명
              </label>
              <input
                type="text"
                value={form.brandName}
                onChange={(event) => updateForm("brandName", event.target.value)}
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
                onChange={(event) => updateForm("productName", event.target.value)}
                placeholder="예: 여성 린넨 오버핏 블라우스"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                카테고리
              </label>
              <select
                value={form.categoryName}
                onChange={(event) =>
                  updateForm("categoryName", event.target.value)
                }
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">선택</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
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
                onChange={(event) => updateForm("material", event.target.value)}
                placeholder="예: 린넨 100%, 면 80% 폴리 20%"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-lg p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Package size={15} className="text-primary" />
              견적 상품 항목
            </h2>
            <button
              type="button"
              onClick={addQuoteItem}
              className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 hover:bg-primary/5 px-3 py-1.5 rounded transition-colors"
            >
              <Plus size={13} />
              항목 추가
            </button>
          </div>

          <div className="space-y-4">
            {quoteItems.map((item, itemIndex) => {
              const quantity = toNumber(item.quantity);
              const unitPrice = toNumber(item.unitPrice);
              const totalPrice = quantity * unitPrice;
              const optionSummary = buildOptionSummary(item.optionValues);

              return (
                <div
                  key={itemIndex}
                  className="border border-border rounded-lg p-4 bg-secondary/30"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        견적 항목 {itemIndex + 1}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        입력한 옵션명/옵션값은 quote_items.option_summary로 저장됩니다.
                      </p>
                    </div>
                    {quoteItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuoteItem(itemIndex)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {item.optionValues.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center"
                      >
                        <input
                          type="text"
                          value={option.optionName}
                          onChange={(event) =>
                            updateOptionValue(
                              itemIndex,
                              optionIndex,
                              "optionName",
                              event.target.value
                            )
                          }
                          placeholder="옵션명 예: 색상"
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                        />
                        <input
                          type="text"
                          value={option.optionValue}
                          onChange={(event) =>
                            updateOptionValue(
                              itemIndex,
                              optionIndex,
                              "optionValue",
                              event.target.value
                            )
                          }
                          placeholder="옵션값 예: 블랙"
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                        />
                        {item.optionValues.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeOptionValue(itemIndex, optionIndex)
                            }
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addOptionValue(itemIndex)}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Plus size={12} />
                      옵션값 추가
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        수량 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(event) =>
                          updateQuoteItem(itemIndex, "quantity", event.target.value)
                        }
                        placeholder="0"
                        min="0"
                        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        단가 <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-muted-foreground">₩</span>
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updateQuoteItem(
                              itemIndex,
                              "unitPrice",
                              event.target.value
                            )
                          }
                          placeholder="0"
                          min="0"
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        항목 금액
                      </label>
                      <div className="border border-border rounded px-3 py-2 text-sm bg-white text-foreground font-medium">
                        {formatPrice(totalPrice)}
                      </div>
                    </div>
                  </div>

                  {optionSummary && (
                    <div className="mt-3 bg-white border border-border rounded px-3 py-2 text-xs text-muted-foreground">
                      옵션 요약: <span className="text-foreground">{optionSummary}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

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

  <select
    value={form.validDays}
    onChange={(event) => updateForm("validDays", event.target.value)}
    className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
  >
    <option value="3">3일</option>
    <option value="5">5일</option>
    <option value="7">7일</option>
    <option value="14">14일</option>
    <option value="30">30일</option>
    <option value="custom">직접 입력</option>
  </select>

  {form.validDays === "custom" && (
    <div className="mt-3 flex items-center gap-2">
      <input
        type="number"
        min="1"
        value={form.customValidDays}
        onChange={(e) =>
          updateForm("customValidDays", e.target.value)
        }
        placeholder="예: 45"
        className="w-32 border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
      />
      <span className="text-sm text-muted-foreground">일</span>
    </div>
  )}

  <p className="text-xs text-muted-foreground mt-1.5">
    선택한 기간 안에 바이어가 견적을 채택해야 합니다.
  </p>
</div>

    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
        샘플 제공 여부
      </label>

      <select
        value={form.sampleAvailable}
        onChange={(event) =>
          updateForm(
            "sampleAvailable",
            event.target.value as "AVAILABLE" | "UNAVAILABLE"
          )
        }
        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
      >
        <option value="AVAILABLE">샘플 제공 가능</option>
        <option value="UNAVAILABLE">샘플 제공 불가</option>
      </select>

      <p className="text-xs text-muted-foreground mt-1.5">
        가능 선택 시 아래에 샘플명, 수량, 단가 입력란이 표시됩니다.
      </p>
    </div>
  </div>
</section>

        {form.sampleAvailable === "AVAILABLE" && (
          <section className="bg-white border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Package size={15} className="text-primary" />
                  샘플 제공 조건
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  현재 DBML에는 샘플 전용 테이블이 없으므로 제출 시 seller_memo에 샘플 조건이 함께 저장됩니다.
                </p>
              </div>
              <button
                type="button"
                onClick={addSampleItem}
                className="flex items-center gap-1.5 text-xs text-primary border border-primary/30 hover:bg-primary/5 px-3 py-1.5 rounded transition-colors"
              >
                <Plus size={13} />
                샘플 추가
              </button>
            </div>

            <div className="space-y-3">
              {sampleItems.map((sample, sampleIndex) => {
                const quantity = toNumber(sample.quantity);
                const unitPrice = toNumber(sample.unitPrice);
                const totalPrice = quantity * unitPrice;

                return (
                  <div
                    key={sampleIndex}
                    className="border border-border rounded-lg p-4 bg-secondary/30"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm font-semibold text-foreground">
                        샘플 항목 {sampleIndex + 1}
                      </p>
                      {sampleItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSampleItem(sampleIndex)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          샘플명
                        </label>
                        <input
                          type="text"
                          value={sample.sampleName}
                          onChange={(event) =>
                            updateSampleItem(
                              sampleIndex,
                              "sampleName",
                              event.target.value
                            )
                          }
                          placeholder="예: 린넨 블라우스 샘플"
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          샘플 수량
                        </label>
                        <input
                          type="number"
                          value={sample.quantity}
                          onChange={(event) =>
                            updateSampleItem(
                              sampleIndex,
                              "quantity",
                              event.target.value
                            )
                          }
                          min="0"
                          placeholder="1"
                          className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          샘플 단가
                        </label>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">₩</span>
                          <input
                            type="number"
                            value={sample.unitPrice}
                            onChange={(event) =>
                              updateSampleItem(
                                sampleIndex,
                                "unitPrice",
                                event.target.value
                              )
                            }
                            min="0"
                            placeholder="0"
                            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          샘플 금액
                        </label>
                        <div className="border border-border rounded px-3 py-2 text-sm bg-white text-foreground font-medium">
                          {formatPrice(totalPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        샘플 메모
                      </label>
                      <textarea
                        value={sample.memo}
                        onChange={(event) =>
                          updateSampleItem(sampleIndex, "memo", event.target.value)
                        }
                        placeholder="예: 샘플비는 본 주문 진행 시 차감 가능"
                        rows={2}
                        className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white resize-none"
                      />
                    </div>
                  </div>
                );
              })}

              <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded px-4 py-3 text-sm">
                <span className="text-blue-700 font-medium">샘플 금액 합계</span>
                <span className="text-blue-900 font-semibold">
                  {formatPrice(sampleTotalAmount)}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <Truck size={15} className="text-primary" />
            출고 및 배송 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                예상 출고 소요일 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.leadTimeDays}
                onChange={(event) =>
                  updateForm("leadTimeDays", event.target.value)
                }
                placeholder="예: 7"
                min="0"
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                예상 배송사
              </label>
              <select
                value={form.deliveryCompany}
                onChange={(event) =>
                  updateForm("deliveryCompany", event.target.value)
                }
                className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary bg-white"
              >
                <option value="">선택</option>
                {SHIPPING_COMPANIES.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                배송비
              </label>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">₩</span>
                <input
                  type="number"
                  value={form.shippingFee}
                  onChange={(event) => updateForm("shippingFee", event.target.value)}
                  placeholder="0"
                  min="0"
                  className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-lg p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText size={15} className="text-primary" />
            셀러 메모
          </h2>
          <textarea
            value={form.sellerMemo}
            onChange={(event) => updateForm("sellerMemo", event.target.value)}
            placeholder="예: 재고 한정 수량으로 빠른 채택 부탁드립니다. 대량 주문 시 추가 할인 협의 가능."
            rows={3}
            className="w-full border border-border rounded px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
          />
        </section>

        {subtotalAmount > 0 && (
          <section className="bg-white border border-border rounded-lg p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock size={15} className="text-primary" />
              견적 요약
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>견적 상품 금액 합계</span>
                <span>{formatPrice(subtotalAmount)}</span>
              </div>
              {form.sampleAvailable === "AVAILABLE" && (
                <div className="flex justify-between text-muted-foreground">
                  <span>샘플 금액 합계</span>
                  <span>{formatPrice(sampleTotalAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>배송비</span>
                <span>{formatPrice(shippingFee)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground text-base">
                <span>최종 견적 금액</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>총 수량</span>
                <span>{totalQuantity.toLocaleString()}장</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>출고 소요일</span>
                <span>{form.leadTimeDays || 0}일</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>견적 유효 기간</span>
                <span>{form.validDays}일</span>
              </div>
            </div>
          </section>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
          <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 space-y-1 leading-relaxed">
            <p className="font-semibold">제출 전 확인하세요</p>
            <p>
              견적서가 바이어에게 채택된 이후에는{" "}
              <strong>단가·배송비·수량 등 견적 내용을 수정할 수 없습니다.</strong>
            </p>
            <p>
              옵션명과 옵션값은 상품 옵션 구조처럼 자유롭게 입력할 수 있으며,
              견적서에는 옵션 요약 스냅샷으로 저장됩니다.
            </p>
            <p>
              샘플 조건은 현재 DB 구조상 별도 테이블이 없으므로 seller_memo에 요약 저장하거나,
              추후 샘플 전용 테이블로 분리할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pb-8">
          <Link
            to="/seller/sourcing-requests"
            className="border border-border text-foreground hover:border-primary hover:text-primary px-6 py-2.5 rounded text-sm font-medium transition-colors"
          >
            취소
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
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
