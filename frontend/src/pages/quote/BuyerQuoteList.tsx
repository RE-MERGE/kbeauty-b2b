import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  Check,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  FlaskConical,
  Search,
  X,
  XCircle,
} from "lucide-react";
import api from "@/api/axios";

type QuoteStatus =
  | "SUBMITTED"
  | "NEGOTIATING"
  | "SAMPLE_REQUESTED"
  | "APPROVED"
  | "REJECTED"
  | "NOT_SELECTED"
  | "EXPIRED";

type BuyerQuote = {
  quoteId: number;
  quoteNo: string;
  sourcingRequestId: number;
  productName: string;
  sellerName: string;
  companyName: string;
  totalAmount: number;
  leadTimeDays: number;
  validUntil: string;
  sampleAvailable: boolean;
  status: QuoteStatus;
  submittedAt: string;
};

type QuoteFilter = "ALL" | "REVIEW" | "APPROVED" | "CLOSED";

type PendingAction = {
  quote: BuyerQuote;
  status: "APPROVED" | "REJECTED";
};

const statusConfig: Record<
  QuoteStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  SUBMITTED: {
    label: "검토 가능",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <FileText size={12} />,
  },
  NEGOTIATING: {
    label: "협의 중",
    className: "border-violet-200 bg-violet-50 text-violet-700",
    icon: <Clock3 size={12} />,
  },
  SAMPLE_REQUESTED: {
    label: "샘플 진행",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <FlaskConical size={12} />,
  },
  APPROVED: {
    label: "채택 완료",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: "거절",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: <XCircle size={12} />,
  },
  NOT_SELECTED: {
    label: "미채택",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: <XCircle size={12} />,
  },
  EXPIRED: {
    label: "기간 만료",
    className: "border-rose-200 bg-rose-50 text-rose-700",
    icon: <Clock3 size={12} />,
  },
};

const filters: Array<{ value: QuoteFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "REVIEW", label: "검토 중" },
  { value: "APPROVED", label: "채택 완료" },
  { value: "CLOSED", label: "종료" },
];

function formatPrice(value: number) {
  return `${value.toLocaleString()}원`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getRemainingDays(value: string) {
  const today = new Date();
  const end = new Date(value);

  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return Math.ceil(
    (end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
}

function matchesFilter(status: QuoteStatus, filter: QuoteFilter) {
  if (filter === "ALL") return true;
  if (filter === "REVIEW") {
    return (
      status === "SUBMITTED" ||
      status === "NEGOTIATING" ||
      status === "SAMPLE_REQUESTED"
    );
  }
  if (filter === "APPROVED") return status === "APPROVED";
  return (
    status === "REJECTED" ||
    status === "NOT_SELECTED" ||
    status === "EXPIRED"
  );
}

export default function BuyerQuoteList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [quotes, setQuotes] = useState<BuyerQuote[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const requestedFilter = searchParams.get("status") as QuoteFilter | null;
  const activeFilter = filters.some(
    (filter) => filter.value === requestedFilter
  )
    ? requestedFilter!
    : "ALL";

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const response =
          await api.get<BuyerQuote[]>("/buyer/quotes");
        setQuotes(response);
      } catch (error) {
        console.error("바이어 견적 목록 조회 실패", error);
        setLoadError("견적 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuotes();
  }, []);

  const visibleQuotes = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return quotes.filter((quote) => {
      const matchesSearch =
        keyword.length === 0 ||
        quote.quoteNo.toLowerCase().includes(keyword) ||
        quote.productName.toLowerCase().includes(keyword) ||
        quote.sellerName?.toLowerCase().includes(keyword) ||
        quote.companyName?.toLowerCase().includes(keyword) ||
        String(quote.sourcingRequestId).includes(keyword);

      return matchesSearch && matchesFilter(quote.status, activeFilter);
    });
  }, [activeFilter, quotes, searchQuery]);

  const quoteGroups = useMemo(() => {
    const groups = new Map<number, BuyerQuote[]>();

    visibleQuotes.forEach((quote) => {
      const current = groups.get(quote.sourcingRequestId) ?? [];
      current.push(quote);
      groups.set(quote.sourcingRequestId, current);
    });

    return Array.from(groups.entries());
  }, [visibleQuotes]);

  const counts = {
    sourcing: new Set(quotes.map((quote) => quote.sourcingRequestId)).size,
    all: quotes.length,
    review: quotes.filter((quote) =>
      matchesFilter(quote.status, "REVIEW")
    ).length,
    approved: quotes.filter((quote) => quote.status === "APPROVED").length,
  };

  const handleFilter = (filter: QuoteFilter) => {
    const next = new URLSearchParams(searchParams);
    if (filter === "ALL") next.delete("status");
    else next.set("status", filter);
    setSearchParams(next);
  };

  const handleStatusUpdate = async () => {
    if (!pendingAction) return;

    const { quote, status } = pendingAction;

    try {
      setIsUpdating(true);
      setActionError("");

      await api.patch(`/quotes/${quote.quoteId}/status`, {
        status,
      });

      setQuotes((currentQuotes) =>
        currentQuotes.map((currentQuote) => {
          if (currentQuote.quoteId === quote.quoteId) {
            return { ...currentQuote, status };
          }

          const shouldMarkNotSelected =
            status === "APPROVED" &&
            currentQuote.sourcingRequestId === quote.sourcingRequestId &&
            (
              currentQuote.status === "SUBMITTED" ||
              currentQuote.status === "NEGOTIATING" ||
              currentQuote.status === "SAMPLE_REQUESTED"
            );

          return shouldMarkNotSelected
            ? { ...currentQuote, status: "NOT_SELECTED" }
            : currentQuote;
        })
      );

      setActionMessage(
        status === "APPROVED"
          ? "견적을 확정했습니다. 셀러가 계약서를 작성한 후 전달할 예정입니다."
          : "견적을 거절했습니다."
      );
      setPendingAction(null);
    } catch (error) {
      console.error("견적 상태 변경 실패", error);
      setActionError(
        error instanceof Error
          ? error.message
          : "견적 상태를 변경하지 못했습니다."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold text-primary">소싱 관리</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              받은 견적
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              소싱 요청별로 접수된 견적의 금액과 납기 조건을 비교합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/buyer/my-sourcing")}
            className="h-10 border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 shadow-sm transition hover:border-primary hover:text-primary"
          >
            소싱 요청 목록
          </button>
        </header>

        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            {
              label: "소싱 요청",
              value: counts.sourcing,
              icon: <FileText size={17} />,
              tone: "bg-slate-100 text-slate-600",
            },
            {
              label: "접수 견적",
              value: counts.all,
              icon: <FileText size={17} />,
              tone: "bg-blue-50 text-blue-700",
            },
            {
              label: "검토 중",
              value: counts.review,
              icon: <Clock3 size={17} />,
              tone: "bg-amber-50 text-amber-700",
            },
            {
              label: "채택 완료",
              value: counts.approved,
              icon: <CheckCircle2 size={17} />,
              tone: "bg-emerald-50 text-emerald-700",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="border border-slate-200 bg-white px-4 py-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  {item.label}
                </span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-md ${item.tone}`}
                >
                  {item.icon}
                </span>
              </div>
              <p className="mt-2 text-2xl font-black text-slate-950">
                {item.value}
                <span className="ml-1 text-sm font-bold text-slate-400">
                  건
                </span>
              </p>
            </div>
          ))}
        </section>

        <section className="mb-5 border border-slate-200 bg-white px-4 pt-4 shadow-sm sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => handleFilter(filter.value)}
                  className={`h-9 shrink-0 border-b-2 px-3 text-sm font-bold transition-colors ${
                    activeFilter === filter.value
                      ? "border-primary text-primary"
                      : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <label className="relative mb-3 block w-full lg:w-96">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="견적번호, 상품명, 공급사, 소싱 요청 ID"
                className="h-10 w-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:bg-white"
              />
            </label>
          </div>
        </section>

        {actionMessage && (
          <div className="mb-4 flex items-center justify-between border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <span>{actionMessage}</span>
            <button
              type="button"
              aria-label="알림 닫기"
              onClick={() => setActionMessage("")}
              className="text-emerald-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {actionError && (
          <div className="mb-4 flex items-center justify-between border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            <span>{actionError}</span>
            <button
              type="button"
              aria-label="오류 알림 닫기"
              onClick={() => setActionError("")}
              className="text-rose-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {isLoading && (
          <div className="border border-slate-200 bg-white px-6 py-20 text-center text-sm font-semibold text-slate-500">
            견적 목록을 불러오는 중입니다.
          </div>
        )}

        {!isLoading && loadError && (
          <div className="border border-rose-200 bg-white px-6 py-20 text-center text-sm font-semibold text-rose-600">
            {loadError}
          </div>
        )}

        {!isLoading && !loadError && quoteGroups.length === 0 && (
          <div className="flex min-h-72 flex-col items-center justify-center border border-slate-200 bg-white px-6 py-12 text-center">
            <FileText size={38} className="text-slate-300" />
            <p className="mt-3 text-base font-black text-slate-800">
              조건에 맞는 견적이 없습니다.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              검색어 또는 견적 상태를 다시 확인해 주세요.
            </p>
          </div>
        )}

        {!isLoading && !loadError && (
          <div className="space-y-4">
            {quoteGroups.map(([sourcingRequestId, groupQuotes]) => {
              const lowestAmount = Math.min(
                ...groupQuotes.map((quote) => quote.totalAmount)
              );
              const shortestLeadTime = Math.min(
                ...groupQuotes.map((quote) => quote.leadTimeDays)
              );
              const representativeProduct = groupQuotes[0]?.productName ?? "-";

              return (
                <section
                  key={sourcingRequestId}
                  className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <header className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-black text-slate-950">
                          소싱 요청 #{sourcingRequestId}
                        </h2>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                          견적 {groupQuotes.length}건
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-600">
                        {representativeProduct}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/buyer/sourcing-detail/${sourcingRequestId}`)
                      }
                      className="text-left text-xs font-bold text-slate-500 transition hover:text-primary sm:text-right"
                    >
                      소싱 요청 확인
                    </button>
                  </header>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[1120px] table-fixed text-left">
                      <thead className="border-b border-slate-100 text-xs font-bold text-slate-500">
                        <tr>
                          <th className="w-[16%] px-5 py-3">견적번호</th>
                          <th className="w-[16%] px-4 py-3">공급사</th>
                          <th className="w-[12%] px-4 py-3">상태</th>
                          <th className="w-[13%] px-4 py-3 text-right">총 견적 금액</th>
                          <th className="w-[10%] px-4 py-3">납기</th>
                          <th className="w-[10%] px-4 py-3">샘플</th>
                          <th className="w-[14%] px-4 py-3">유효기간</th>
                          <th className="w-[17%] px-5 py-3 text-right">처리</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {groupQuotes.map((quote) => {
                          const status =
                            statusConfig[quote.status] ??
                            statusConfig.SUBMITTED;
                          const remainingDays =
                            getRemainingDays(quote.validUntil);
                          const isLowest = quote.totalAmount === lowestAmount;
                          const isFastest =
                            quote.leadTimeDays === shortestLeadTime;
                          const groupHasApprovedQuote =
                            groupQuotes.some(
                              (groupQuote) =>
                                groupQuote.status === "APPROVED"
                            );
                          const canRespond =
                            quote.status === "SUBMITTED" &&
                            !groupHasApprovedQuote;

                          return (
                            <tr
                              key={quote.quoteId}
                              className="align-middle transition-colors hover:bg-slate-50/70"
                            >
                              <td className="px-5 py-4">
                                <p className="font-mono text-sm font-black text-slate-950">
                                  {quote.quoteNo}
                                </p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {formatDate(quote.submittedAt)} 제출
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <p className="truncate text-sm font-bold text-slate-900">
                                  {quote.companyName || "공급사"}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-400">
                                  {quote.sellerName || "-"}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 border px-2 py-1 text-xs font-bold ${status.className}`}
                                >
                                  {status.icon}
                                  {status.label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <p className="text-sm font-black text-slate-950">
                                  {formatPrice(quote.totalAmount)}
                                </p>
                                {isLowest && groupQuotes.length > 1 && (
                                  <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                    최저 견적
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-sm font-bold text-slate-700">
                                  {quote.leadTimeDays}일
                                </p>
                                {isFastest && groupQuotes.length > 1 && (
                                  <p className="mt-1 text-[11px] font-bold text-blue-700">
                                    최단 납기
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 text-xs font-bold ${
                                    quote.sampleAvailable
                                      ? "text-emerald-700"
                                      : "text-slate-400"
                                  }`}
                                >
                                  {quote.sampleAvailable ? (
                                    <Check size={14} />
                                  ) : (
                                    <X size={14} />
                                  )}
                                  {quote.sampleAvailable ? "가능" : "불가"}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <p
                                  className={`text-sm font-bold ${
                                    remainingDays < 0
                                      ? "text-rose-600"
                                      : remainingDays <= 3
                                        ? "text-amber-700"
                                        : "text-slate-700"
                                  }`}
                                >
                                  {formatDate(quote.validUntil)}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-400">
                                  {remainingDays < 0
                                    ? "기간 만료"
                                    : remainingDays === 0
                                      ? "오늘 만료"
                                      : `D-${remainingDays}`}
                                </p>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {canRespond && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPendingAction({
                                            quote,
                                            status: "REJECTED",
                                          })
                                        }
                                        className="h-9 border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
                                      >
                                        거절
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setPendingAction({
                                            quote,
                                            status: "APPROVED",
                                          })
                                        }
                                        className="h-9 bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary/90"
                                      >
                                        확정
                                      </button>
                                    </>
                                  )}
                                  <button
                                    type="button"
                                    title="견적 상세"
                                    aria-label={`${quote.quoteNo} 상세 보기`}
                                    onClick={() =>
                                      navigate(
                                        `/buyer/quotes/${quote.quoteId}`
                                      )
                                    }
                                    className="inline-flex h-9 w-9 items-center justify-center border border-slate-200 text-slate-500 transition hover:border-primary hover:text-primary"
                                  >
                                    <Eye size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {pendingAction && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="quote-action-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4"
          >
            <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  pendingAction.status === "APPROVED"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-600"
                }`}
              >
                {pendingAction.status === "APPROVED" ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <XCircle size={20} />
                )}
              </div>

              <h2
                id="quote-action-title"
                className="mt-4 text-lg font-black text-slate-950"
              >
                {pendingAction.status === "APPROVED"
                  ? "이 견적을 확정하시겠습니까?"
                  : "이 견적을 거절하시겠습니까?"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {pendingAction.status === "APPROVED"
                  ? "확정하면 나머지 견적은 미채택 처리되며, 셀러가 확인 후 계약서를 작성해 전달합니다."
                  : "거절한 견적은 다시 확정할 수 없습니다."}
              </p>

              <div className="mt-4 border-y border-slate-100 py-3">
                <p className="text-sm font-bold text-slate-900">
                  {pendingAction.quote.productName}
                </p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {pendingAction.quote.quoteNo}
                </p>
                <p className="mt-2 text-sm font-black text-primary">
                  {formatPrice(pendingAction.quote.totalAmount)}
                </p>
              </div>

              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => setPendingAction(null)}
                  className="h-10 flex-1 border border-slate-200 text-sm font-bold text-slate-600 disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleStatusUpdate}
                  className={`h-10 flex-1 text-sm font-bold text-white disabled:opacity-50 ${
                    pendingAction.status === "APPROVED"
                      ? "bg-primary"
                      : "bg-rose-600"
                  }`}
                >
                  {isUpdating
                    ? "처리 중..."
                    : pendingAction.status === "APPROVED"
                      ? "견적 확정"
                      : "견적 거절"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
