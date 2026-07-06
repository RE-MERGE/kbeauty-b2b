import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Handshake,
  LoaderCircle,
  MessageSquareText,
  Search,
  Send,
  UserRound,
  X,
} from "lucide-react";
import api from "@/api/axios";

type NegotiationStatus = "OPEN" | "AGREED" | "CLOSED";
type NegotiationFilter = "ALL" | NegotiationStatus;

type NegotiationResponse = {
  negotiationId: number;
  negotiationType: "QUOTE" | "CONTRACT";
  quoteId: number | null;
  quoteNo: string | null;
  productName: string | null;
  buyerName: string | null;
  sellerName: string | null;
  adminName: string | null;
  status: NegotiationStatus;
  title: string;
  latestRequest: string | null;
  openedAt: string;
  updatedAt: string;
  agreedAt: string | null;
  closedAt: string | null;
};

type NegotiationLocationState = {
  quoteId?: number;
  requestId?: number;
};

const filters: Array<{ value: NegotiationFilter; label: string }> = [
  { value: "ALL", label: "전체" },
  { value: "OPEN", label: "협의 중" },
  { value: "AGREED", label: "합의 완료" },
  { value: "CLOSED", label: "종료" },
];

const statusConfig: Record<
  NegotiationStatus,
  { label: string; className: string; icon: React.ReactNode }
> = {
  OPEN: {
    label: "협의 중",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <Clock3 size={13} />,
  },
  AGREED: {
    label: "합의 완료",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: <CheckCircle2 size={13} />,
  },
  CLOSED: {
    label: "종료",
    className: "border-slate-200 bg-slate-100 text-slate-600",
    icon: <X size={13} />,
  },
};

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function Negotiations() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as NegotiationLocationState | null;

  const [negotiations, setNegotiations] = useState<NegotiationResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] =
    useState<NegotiationFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalQuoteId, setModalQuoteId] = useState<number | null>(null);
  const [buyerRequest, setBuyerRequest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadNegotiations = async () => {
    try {
      setIsLoading(true);
      setLoadError("");
      const response =
        await api.get<NegotiationResponse[]>("/negotiations");

      setNegotiations(response);
      setSelectedId((current) => {
        if (
          current !== null
          && response.some((item) => item.negotiationId === current)
        ) {
          return current;
        }

        return response[0]?.negotiationId ?? null;
      });
    } catch (error) {
      console.error("협의 목록 조회 실패", error);
      setLoadError(
        error instanceof Error
          ? error.message
          : "협의 목록을 불러오지 못했습니다.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadNegotiations();
  }, []);

  useEffect(() => {
    if (!locationState?.quoteId) return;

    setModalQuoteId(locationState.quoteId);
    setBuyerRequest("");
    setSubmitError("");

    navigate(location.pathname, {
      replace: true,
      state: null,
    });
  }, [location.pathname, locationState?.quoteId, navigate]);

  const visibleNegotiations = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return negotiations.filter((item) => {
      const matchesFilter =
        activeFilter === "ALL" || item.status === activeFilter;

      const matchesSearch =
        keyword.length === 0
        || item.title.toLowerCase().includes(keyword)
        || (item.quoteNo?.toLowerCase().includes(keyword) ?? false)
        || (item.productName?.toLowerCase().includes(keyword) ?? false);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, negotiations, searchQuery]);

  const selected =
    negotiations.find((item) => item.negotiationId === selectedId) ?? null;

  const counts = {
    all: negotiations.length,
    open: negotiations.filter((item) => item.status === "OPEN").length,
    agreed: negotiations.filter((item) => item.status === "AGREED").length,
    closed: negotiations.filter((item) => item.status === "CLOSED").length,
  };

  const openRequestModal = (quoteId: number | null) => {
    if (!quoteId) return;
    setModalQuoteId(quoteId);
    setBuyerRequest("");
    setSubmitError("");
  };

  const closeRequestModal = () => {
    if (isSubmitting) return;
    setModalQuoteId(null);
    setBuyerRequest("");
    setSubmitError("");
  };

  const handleSubmit = async () => {
    if (!modalQuoteId || !buyerRequest.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await api.post(`/negotiations/${modalQuoteId}/new`, {
        buyerRequest: buyerRequest.trim(),
      });

      setModalQuoteId(null);
      setBuyerRequest("");
      setSubmitError("");
      setSuccessMessage("협의 요청을 등록했습니다.");
      await loadNegotiations();
    } catch (error) {
      console.error("협의 요청 등록 실패", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "협의 요청을 등록하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <main className="mx-auto w-full max-w-[1380px] px-4 py-8 sm:px-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-blue-700">
              Trade Communication
            </p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              협의 관리
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              견적 조건에 대한 요청과 합의 진행 상태를 확인합니다.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="견적번호 또는 상품명 검색"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </header>

        {successMessage && (
          <div className="mt-5 flex items-center justify-between rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} />
              {successMessage}
            </span>
            <button
              type="button"
              title="알림 닫기"
              onClick={() => setSuccessMessage("")}
              className="inline-flex size-7 items-center justify-center rounded-md hover:bg-emerald-100"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="전체 협의"
            value={counts.all}
            icon={<MessageSquareText size={18} />}
            iconClassName="bg-slate-100 text-slate-600"
          />
          <StatCard
            label="진행 중"
            value={counts.open}
            icon={<Handshake size={18} />}
            iconClassName="bg-blue-50 text-blue-700"
          />
          <StatCard
            label="합의 완료"
            value={counts.agreed}
            icon={<CheckCircle2 size={18} />}
            iconClassName="bg-emerald-50 text-emerald-700"
          />
          <StatCard
            label="종료"
            value={counts.closed}
            icon={<X size={18} />}
            iconClassName="bg-slate-100 text-slate-500"
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`h-8 rounded-md border px-3 text-xs font-bold transition ${
                    activeFilter === filter.value
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-400"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-slate-500">
              {visibleNegotiations.length}건
            </p>
          </div>

          {isLoading ? (
            <div className="flex min-h-72 items-center justify-center text-sm font-semibold text-slate-500">
              <LoaderCircle size={18} className="mr-2 animate-spin" />
              협의 목록을 불러오는 중입니다.
            </div>
          ) : loadError ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
              <AlertCircle size={30} className="text-rose-500" />
              <p className="mt-3 text-sm font-bold text-slate-900">
                협의 목록을 불러오지 못했습니다.
              </p>
              <p className="mt-1 text-xs text-slate-500">{loadError}</p>
            </div>
          ) : visibleNegotiations.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-4 text-center">
              <MessageSquareText size={32} className="text-slate-300" />
              <p className="mt-3 text-sm font-bold text-slate-900">
                표시할 협의가 없습니다.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                견적 목록에서 협의를 요청하면 이곳에서 확인할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1040px] text-left">
                <thead className="border-b border-slate-200 text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">협의 대상</th>
                    <th className="px-4 py-3">참여자</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">최근 요청</th>
                    <th className="px-4 py-3">최근 수정</th>
                    <th className="px-5 py-3 text-right">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleNegotiations.map((item) => {
                    const status =
                      statusConfig[item.status] ?? statusConfig.OPEN;
                    const isSelected =
                      selectedId === item.negotiationId;

                    return (
                      <tr
                        key={item.negotiationId}
                        className={`transition ${
                          isSelected ? "bg-blue-50/60" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedId(item.negotiationId)
                            }
                            className="text-left"
                          >
                            <p className="text-sm font-black text-slate-950">
                              {item.productName || item.title}
                            </p>
                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {item.quoteNo || `협의 #${item.negotiationId}`}
                            </p>
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <p className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                            <UserRound size={14} className="text-slate-400" />
                            {item.buyerName || "바이어"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            상대 {item.sellerName || "셀러"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${status.className}`}
                          >
                            {status.icon}
                            {status.label}
                          </span>
                        </td>
                        <td className="max-w-[300px] px-4 py-4">
                          <p className="truncate text-sm text-slate-700">
                            {item.latestRequest || "등록된 요청 내용 없음"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                          {formatDateTime(item.updatedAt)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              title="협의 상세 보기"
                              onClick={() =>
                                setSelectedId(item.negotiationId)
                              }
                              className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-400 hover:text-slate-900"
                            >
                              <ChevronRight size={16} />
                            </button>
                            {item.status === "OPEN" && item.quoteId && (
                              <button
                                type="button"
                                onClick={() =>
                                  openRequestModal(item.quoteId)
                                }
                                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 text-xs font-bold text-white transition hover:bg-blue-700"
                              >
                                <MessageSquareText size={14} />
                                협의 계속
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selected && (
          <section className="mt-6 grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                  <FileText size={13} />
                  {selected.negotiationType === "QUOTE"
                    ? "견적 협의"
                    : "계약 협의"}
                </span>
                <span className="font-mono text-xs text-slate-400">
                  {selected.quoteNo || `#${selected.negotiationId}`}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-black text-slate-950">
                {selected.title}
              </h2>
              <p className="mt-4 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                {selected.latestRequest || "등록된 협의 요청 내용이 없습니다."}
              </p>
            </div>

            <dl className="border-t border-slate-200 bg-slate-50 p-5 text-sm lg:border-l lg:border-t-0">
              <DetailRow
                label="협의 시작"
                value={formatDateTime(selected.openedAt)}
              />
              <DetailRow
                label="최근 수정"
                value={formatDateTime(selected.updatedAt)}
              />
              <DetailRow
                label="합의 일시"
                value={formatDateTime(selected.agreedAt)}
              />
              <DetailRow
                label="종료 일시"
                value={formatDateTime(selected.closedAt)}
              />
            </dl>
          </section>
        )}
      </main>

      {modalQuoteId !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="negotiation-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4"
        >
          <div className="w-full max-w-[560px] overflow-hidden rounded-lg bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-black text-blue-700">
                  견적 #{modalQuoteId}
                </p>
                <h2
                  id="negotiation-modal-title"
                  className="mt-1 text-lg font-black text-slate-950"
                >
                  협의 요청 작성
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  조정이 필요한 수량, 단가, 납기 또는 상품 조건을 구체적으로
                  작성해 주세요.
                </p>
              </div>
              <button
                type="button"
                title="모달 닫기"
                onClick={closeRequestModal}
                className="inline-flex size-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={17} />
              </button>
            </div>

            <div className="px-6 py-5">
              <label htmlFor="buyer-request" className="block">
                <span className="text-sm font-black text-slate-800">
                  협의 요청 내용
                </span>
                <textarea
                  id="buyer-request"
                  rows={7}
                  maxLength={2000}
                  value={buyerRequest}
                  onChange={(event) => setBuyerRequest(event.target.value)}
                  placeholder="예: 최소 주문 수량을 300개에서 200개로 조정할 수 있는지 확인 부탁드립니다."
                  className="mt-2 w-full resize-none rounded-md border border-slate-200 px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="mt-2 flex items-start justify-between gap-3">
                <p className="text-xs leading-5 text-slate-500">
                  연락처, 계좌번호 등 직접 거래를 유도하는 정보는 입력하지
                  마세요.
                </p>
                <span className="shrink-0 text-xs font-semibold text-slate-400">
                  {buyerRequest.length}/2000
                </span>
              </div>

              {submitError && (
                <p className="mt-4 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0" />
                  {submitError}
                </p>
              )}
            </div>

            <div className="flex gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeRequestModal}
                className="h-10 flex-1 rounded-md border border-slate-200 bg-white text-sm font-bold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                disabled={!buyerRequest.trim() || isSubmitting}
                onClick={() => void handleSubmit()}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting ? (
                  <LoaderCircle size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {isSubmitting ? "등록 중..." : "협의 요청 보내기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconClassName,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-bold text-slate-500">{label}</p>
        <span
          className={`inline-flex size-9 items-center justify-center rounded-md ${iconClassName}`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <dt className="text-xs font-bold text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-700">{value}</dd>
    </div>
  );
}
