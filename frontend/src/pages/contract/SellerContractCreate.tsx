import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  FileSignature,
  Package,
  Save,
} from "lucide-react";
import api from "@/api/axios";

type QuoteItem = {
  quoteItemId: number;
  optionSummary: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isSample: boolean;
};

type QuoteDetail = {
  quoteId: number;
  quoteNo: string;
  productName: string;
  material: string | null;
  leadTimeDays: number;
  deliveryCompany: string | null;
  shippingFee: number;
  totalAmount: number;
  status: string;
  buyerName: string;
  companyName: string;
  items: QuoteItem[];
};

type ContractForm = {
  deliveryDate: string;
  paymentTerms: string;
  returnPolicy: string;
  specialTerms: string;
};

const INITIAL_FORM: ContractForm = {
  deliveryDate: getToday(),
  paymentTerms: "계약 체결 후 결제를 진행합니다.",
  returnPolicy:
    "불량 및 오배송 상품은 확인 후 교환 또는 환불을 진행합니다.",
  specialTerms: "",
};

function formatPrice(value: number) {
  return `${value.toLocaleString()}원`;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export function SellerContractCreate() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();

  const [quote, setQuote] = useState<QuoteDetail>();
  const [form, setForm] = useState<ContractForm>(INITIAL_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    if (!quoteId) {
      setLoadError("견적 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    const loadQuote = async () => {
      try {
        setIsLoading(true);
        setLoadError("");

        const response = await api.get<QuoteDetail>(`/quotes/${quoteId}`);
        setQuote(response);
      } catch (error) {
        console.error("계약서 작성용 견적 조회 실패", error);
        setLoadError("채택된 견적 정보를 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuote();
  }, [quoteId]);

  const totalQuantity = useMemo(
    () =>
      quote?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [quote]
  );

  const canSave =
    quote?.status === "APPROVED" &&
    form.deliveryDate.length > 0 &&
    form.paymentTerms.trim().length > 0 &&
    form.returnPolicy.trim().length > 0 &&
    !isSaving;

  const updateForm = (field: keyof ContractForm, value: string) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSaveDraft = async () => {
    if (!quote || !canSave) return;

    try {
      setIsSaving(true);
      setSaveError("");

      await api.post("/seller/contracts", {
        quoteId: quote.quoteId,
        deliveryDate: form.deliveryDate,
        paymentTerms: form.paymentTerms.trim(),
        returnPolicy: form.returnPolicy.trim(),
        specialTerms: form.specialTerms.trim() || null,
      });

      navigate(`/seller/contracts/quotes/${quote.quoteId}`);
    } catch (error) {
      console.error("계약서 초안 저장 실패", error);
      setSaveError(
        error instanceof Error
          ? error.message
          : "계약서 초안을 저장하지 못했습니다."
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-sm font-semibold text-slate-500">
        견적 정보를 불러오는 중입니다.
      </div>
    );
  }

  if (!quote || loadError) {
    return (
      <div className="mx-auto max-w-[680px] px-4 py-20 text-center">
        <AlertCircle className="mx-auto text-rose-400" size={42} />
        <h1 className="mt-4 text-xl font-black text-slate-900">
          계약서를 작성할 수 없습니다.
        </h1>
        <p className="mt-2 text-sm text-slate-500">{loadError}</p>
        <Link
          to="/seller/quotes"
          className="mt-6 inline-flex h-10 items-center bg-primary px-5 text-sm font-bold text-white"
        >
          견적 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-[1120px] px-4 py-7 sm:px-6">
        <Link
          to={`/seller/quotes/${quote.quoteId}`}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ChevronLeft size={15} />
          견적 상세로
        </Link>

        <header className="border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <FileSignature size={17} />
                신규 계약서 작성
              </div>
              <h1 className="mt-2 text-2xl font-black text-slate-950">
                {quote.productName}
              </h1>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {quote.quoteNo}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold text-slate-400">계약 예정 금액</p>
              <p className="mt-1 text-2xl font-black text-primary">
                {formatPrice(quote.totalAmount)}
              </p>
            </div>
          </div>
        </header>

        {quote.status !== "APPROVED" && (
          <div className="mt-4 flex items-start gap-2 border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            채택 완료된 견적서만 계약서를 작성할 수 있습니다.
          </div>
        )}

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-5">
            <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <Package size={16} className="text-primary" />
                <h2 className="text-sm font-black text-slate-900">계약 품목</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-5 py-3">옵션</th>
                      <th className="px-4 py-3 text-right">수량</th>
                      <th className="px-4 py-3 text-right">단가</th>
                      <th className="px-5 py-3 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items.map((item) => (
                      <tr key={item.quoteItemId}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {item.optionSummary || "기본 옵션"}
                          </p>
                          {item.isSample && (
                            <span className="mt-1 inline-flex bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">
                              샘플
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                          {item.quantity.toLocaleString()}개
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                          {formatPrice(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <CalendarDays size={16} className="text-primary" />
                <h2 className="text-sm font-black text-slate-900">계약 조건</h2>
              </div>

              <div className="mt-5 grid gap-5">
                <label className="block">
                  <span className="text-xs font-bold text-slate-600">
                    납품 예정일 <span className="text-rose-500">*</span>
                  </span>
                  <input
                    type="date"
                    min={getToday()}
                    value={form.deliveryDate}
                    onChange={(event) =>
                      updateForm("deliveryDate", event.target.value)
                    }
                    className="mt-1.5 h-10 w-full border border-slate-200 px-3 text-sm outline-none transition focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">
                    결제 조건 <span className="text-rose-500">*</span>
                  </span>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.paymentTerms}
                    onChange={(event) =>
                      updateForm("paymentTerms", event.target.value)
                    }
                    className="mt-1.5 w-full resize-none border border-slate-200 px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">
                    반품·교환 조건 <span className="text-rose-500">*</span>
                  </span>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={form.returnPolicy}
                    onChange={(event) =>
                      updateForm("returnPolicy", event.target.value)
                    }
                    className="mt-1.5 w-full resize-none border border-slate-200 px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold text-slate-600">특약사항</span>
                  <textarea
                    rows={4}
                    maxLength={2000}
                    value={form.specialTerms}
                    onChange={(event) =>
                      updateForm("specialTerms", event.target.value)
                    }
                    placeholder="추가로 합의할 조건이 있을 경우 입력하세요."
                    className="mt-1.5 w-full resize-none border border-slate-200 px-3 py-2 text-sm leading-6 outline-none transition focus:border-primary"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <h2 className="text-sm font-black text-slate-900">계약 요약</h2>
            <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">바이어</dt>
                <dd className="font-bold text-slate-900">{quote.buyerName}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">총 수량</dt>
                <dd className="font-bold text-slate-900">
                  {totalQuantity.toLocaleString()}개
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">배송사</dt>
                <dd className="font-bold text-slate-900">
                  {quote.deliveryCompany || "협의 배송"}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">배송비</dt>
                <dd className="font-bold text-slate-900">
                  {formatPrice(quote.shippingFee)}
                </dd>
              </div>
            </dl>

            <div className="flex items-end justify-between py-4">
              <span className="text-sm font-bold text-slate-600">계약 총액</span>
              <span className="text-xl font-black text-primary">
                {formatPrice(quote.totalAmount)}
              </span>
            </div>

            {saveError && (
              <div className="mb-3 flex items-start gap-2 border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                <AlertCircle size={14} className="shrink-0" />
                {saveError}
              </div>
            )}

            <button
              type="button"
              disabled={!canSave}
              onClick={handleSaveDraft}
              className="inline-flex h-11 w-full items-center justify-center gap-2 bg-primary text-sm font-black text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Save size={16} />
              {isSaving ? "저장 중..." : "계약서 초안 저장"}
            </button>
            <p className="mt-3 text-center text-xs leading-5 text-slate-400">
              초안 저장 후 계약 내용을 다시 확인하고 서명할 수 있습니다.
            </p>
          </aside>
        </div>
      </main>
    </div>
  );
}
