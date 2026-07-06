import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Clock,
  FileText,
  MessageSquare,
  Search,
  Send,
  User,
  ShieldAlert,
} from "lucide-react";
import { useLocation, useParams } from "react-router";
import api from "@/api/axios";

type DisputeStatus =
  | "RECEIVED"
  | "REVIEWING"
  | "WAITING_SELLER"
  | "WAITING_BUYER"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELED";

type ResponderRole = "BUYER" | "SELLER" | "ADMIN";

type DisputeListResponse = {
  disputeId: number;
  orderId: number;
  orderNo: string;
  title: string;
  disputeType: string;
  status: DisputeStatus;
  requestedAction: string;
  buyerClaim: string;
  receivedAt: string;
};

type DisputeResponseItem = {
  responseId: number;
  responderRole: ResponderRole;
  status: DisputeStatus;
  content: string;
  createdAt: string;
};

type DisputeDetailResponse = DisputeListResponse & {
  responses: DisputeResponseItem[];
};

const STATUS_CONFIG: Record<
  DisputeStatus,
  { label: string; className: string }
> = {
  RECEIVED: {
    label: "접수 완료",
    className: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
  REVIEWING: {
    label: "관리자 검토 중",
    className: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  WAITING_SELLER: {
    label: "판매사 답변 대기",
    className: "bg-purple-50 text-purple-700 ring-purple-600/20",
  },
  WAITING_BUYER: {
    label: "바이어 답변 대기",
    className: "bg-pink-50 text-pink-700 ring-pink-600/20",
  },
  RESOLVED: {
    label: "처리 완료",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  },
  REJECTED: {
    label: "기각",
    className: "bg-rose-50 text-rose-700 ring-rose-600/20",
  },
  CANCELED: {
    label: "취소",
    className: "bg-gray-50 text-gray-600 ring-gray-500/10",
  },
};

const TYPE_LABELS: Record<string, string> = {
  DELIVERY_DELAY: "배송 지연",
  MISSING_ITEM: "수량 부족",
  PAYMENT: "결제 문제",
  PRODUCT_DEFECT: "상품 하자",
  WRONG_ITEM: "오배송",
  ETC: "기타",
};

const ACTION_LABELS: Record<string, string> = {
  EXCHANGE: "교환",
  PARTIAL_REFUND: "부분 환불",
  REFUND: "환불",
  RE_DELIVERY: "재배송",
  ETC: "기타",
};

const ROLE_LABELS: Record<ResponderRole, string> = {
  BUYER: "바이어",
  SELLER: "판매사",
  ADMIN: "관리자",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export function Disputes() {
  const location = useLocation();
  const { disputeId } = useParams();
  const isSeller = location.pathname.startsWith("/seller");
  const [disputes, setDisputes] = useState<DisputeListResponse[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(
    disputeId ? Number(disputeId) : null,
  );
  const [detail, setDetail] = useState<DisputeDetailResponse | null>(null);
  const [filter, setFilter] = useState<DisputeStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [reply, setReply] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");

  const apiPrefix = isSeller ? "/seller/orders" : "/buyer/orders";
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminReason, setAdminReason] = useState("");

  useEffect(() => {
    const loadDisputes = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await api.get<DisputeListResponse[]>(
          `${apiPrefix}/disputes`,
        );
        setDisputes(response);
        setSelectedId((current) => {
          if (current && response.some((item) => item.disputeId === current)) {
            return current;
          }
          return response[0]?.disputeId ?? null;
        });
      } catch (loadError) {
        console.error("이의제기 목록 조회 실패", loadError);
        setError("이의제기 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadDisputes();
  }, [apiPrefix]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    const loadDetail = async () => {
      try {
        setIsDetailLoading(true);
        setDetailError("");
        const response = await api.get<DisputeDetailResponse>(
          `${apiPrefix}/disputes/${selectedId}`,
        );
        setDetail(response);
      } catch (loadError) {
        console.error("이의제기 상세 조회 실패", loadError);
        setDetail(null);
        setDetailError("이의제기 상세 내용을 불러오지 못했습니다.");
      } finally {
        setIsDetailLoading(false);
      }
    };

    void loadDetail();
  }, [apiPrefix, selectedId]);

  useEffect(() => {
    const syncDisputes = async () => {
      try {
        const list = await api.get<DisputeListResponse[]>(
          `${apiPrefix}/disputes`,
        );
        setDisputes(list);

        if (selectedId) {
          const selectedDetail = await api.get<DisputeDetailResponse>(
            `${apiPrefix}/disputes/${selectedId}`,
          );
          setDetail(selectedDetail);
        }
      } catch (syncError) {
        console.error("이의제기 상태 동기화 실패", syncError);
      }
    };

    const handleFocus = () => {
      void syncDisputes();
    };

    const intervalId = window.setInterval(() => {
      void syncDisputes();
    }, 10_000);

    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
    };
  }, [apiPrefix, selectedId]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return disputes.filter((item) => {
      const matchesFilter = filter === "ALL" || item.status === filter;
      const matchesSearch =
        !keyword ||
        item.orderNo.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword) ||
        item.buyerClaim.toLowerCase().includes(keyword);
      return matchesFilter && matchesSearch;
    });
  }, [disputes, filter, search]);

  const canReply =
    detail != null &&
    (isSeller
      ? detail.status === "RECEIVED" || detail.status === "WAITING_SELLER"
      : detail.status === "WAITING_BUYER");

  const counts = {
    all: disputes.length,
    received: disputes.filter((item) => item.status === "RECEIVED").length,
    waiting: disputes.filter(
      (item) =>
        item.status === "WAITING_SELLER" || item.status === "WAITING_BUYER",
    ).length,
    resolved: disputes.filter((item) => item.status === "RESOLVED").length,
  };

  const submitReply = async () => {
    if (!detail || !reply.trim() || !canReply) return;

    try {
      setIsSubmitting(true);
      setDetailError("");
      const response = await api.post<DisputeResponseItem>(
        `${apiPrefix}/disputes/${detail.disputeId}/responses`,
        { content: reply.trim() },
      );
      const nextStatus = response.status;
      setDetail((current) =>
        current
          ? {
              ...current,
              status: nextStatus,
              responses: [...current.responses, response],
            }
          : current,
      );
      setDisputes((current) =>
        current.map((item) =>
          item.disputeId === detail.disputeId
            ? { ...item, status: nextStatus }
            : item,
        ),
      );
      setReply("");
    } catch (submitError) {
      console.error("이의제기 답변 등록 실패", submitError);
      setDetailError(
        submitError instanceof Error
          ? submitError.message
          : "답변을 등록하지 못했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveDispute = async () => {
    if (!detail) return;

    try {
      await api.post(`${apiPrefix}/disputes/${detail.disputeId}/resolve`);

      setDetail((current) =>
        current ? { ...current, status: "RESOLVED" } : current,
      );

      setDisputes((current) =>
        current.map((item) =>
          item.disputeId === detail.disputeId
            ? { ...item, status: "RESOLVED" }
            : item,
        ),
      );
    } catch (error) {
      console.error("이의제기 처리 완료 실패", error);
      alert("처리 완료에 실패했습니다.");
    }
  };

  const requestAdminReview = async () => {
    if (!detail || !adminReason.trim()) return;

    try {
      await api.post(`${apiPrefix}/disputes/${detail.disputeId}/admin-review`, {
        content: adminReason.trim(),
      });

      setDetail((current) =>
        current ? { ...current, status: "REVIEWING" } : current,
      );

      setDisputes((current) =>
        current.map((item) =>
          item.disputeId === detail.disputeId
            ? { ...item, status: "REVIEWING" }
            : item,
        ),
      );

      setAdminReason("");
      setIsAdminModalOpen(false);
    } catch (error) {
      console.error("관리자 검토 요청 실패", error);
      alert("관리자 검토 요청에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단 헤더 */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              이의제기 관리
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {isSeller
                ? "판매 주문에 접수된 이의제기와 답변 상태를 확인합니다."
                : "접수한 이의제기와 판매사의 답변을 확인합니다."}
            </p>
          </div>
        </div>

        {/* 대시보드 카드 섹션 */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            label="전체 이의제기"
            value={counts.all}
            icon={<AlertCircle className="h-6 w-6 text-gray-600" />}
            bgClass="bg-white"
          />
          <StatCard
            label="접수 완료"
            value={counts.received}
            icon={<FileText className="h-6 w-6 text-blue-600" />}
            bgClass="bg-white"
          />
          <StatCard
            label="답변 대기"
            value={counts.waiting}
            icon={<MessageSquare className="h-6 w-6 text-purple-600" />}
            bgClass="bg-white"
          />
          <StatCard
            label="처리 완료"
            value={counts.resolved}
            icon={<Clock className="h-6 w-6 text-emerald-600" />}
            bgClass="bg-white"
          />
        </div>

        {/* 메인 대시보드 레이아웃 */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 items-start">

          {/* 왼쪽: 이의제기 목록 영역 */}
          <div className="lg:col-span-1 bg-white shadow rounded-lg overflow-hidden border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col gap-3">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 sm:text-sm border-gray-300 rounded-md h-9 outline-none border px-2"
                  placeholder="주문번호 또는 제목 검색"
                />
              </div>
              <div className="flex items-center justify-between">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as DisputeStatus | "ALL")}
                  className="block w-full text-xs border-gray-300 rounded-md bg-white border h-8 px-2 font-medium text-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="ALL">전체 상태</option>
                  {Object.entries(STATUS_CONFIG).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-semibold text-gray-500 ml-2 shrink-0">
                  총 {filtered.length}건
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-gray-500 font-medium">
                  이의제기 목록을 불러오는 중입니다.
                </div>
              ) : error ? (
                <div className="p-8 text-center">
                  <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
                  <p className="mt-2 text-sm font-semibold text-gray-900">목록 로드 실패</p>
                  <p className="mt-1 text-xs text-gray-500">{error}</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <FileText className="mx-auto h-8 w-8 text-gray-300" />
                  <p className="mt-2 text-sm font-semibold text-gray-900">표시할 내용 없음</p>
                </div>
              ) : (
                filtered.map((item) => {
                  const isSelected = selectedId === item.disputeId;
                  return (
                    <div
                      key={item.disputeId}
                      onClick={() => setSelectedId(item.disputeId)}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono text-gray-400">
                          {item.orderNo}
                        </span>
                        <StatusBadge status={item.status} />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>{TYPE_LABELS[item.disputeType] ?? item.disputeType}</span>
                        <span>{formatDate(item.receivedAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 오른쪽: 상세 정보 및 히스토리 영역 */}
          <div className="lg:col-span-2">
            {selectedId && (
              <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
                {isDetailLoading ? (
                  <div className="p-12 text-center text-sm text-gray-500 font-medium">
                    상세 내용을 불러오는 중입니다.
                  </div>
                ) : detailError && !detail ? (
                  <div className="p-12 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                    <p className="mt-3 text-base font-semibold text-gray-900">상세 로드 실패</p>
                    <p className="mt-1 text-sm text-gray-500">{detailError}</p>
                  </div>
                ) : detail ? (
                  <>
                    <div className="px-6 py-5 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold leading-6 text-gray-900">
                            {detail.title}
                          </h3>
                          <StatusBadge status={detail.status} />
                        </div>
                        <p className="text-xs font-mono text-gray-500">
                          주문번호: {detail.orderNo} | 이의제기 번호: #{detail.disputeId}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-gray-200 divide-y sm:divide-y-0 sm:divide-x divide-gray-200 bg-white">
                      <div className="px-6 py-4">
                        <span className="text-xs text-gray-400 block mb-1">유형</span>
                        <span className="text-sm font-medium text-gray-900">
                          {TYPE_LABELS[detail.disputeType] ?? detail.disputeType}
                        </span>
                      </div>
                      <div className="px-6 py-4">
                        <span className="text-xs text-gray-400 block mb-1">요청 처리 사항</span>
                        <span className="text-sm font-medium text-gray-900">
                          {ACTION_LABELS[detail.requestedAction] ?? detail.requestedAction}
                        </span>
                      </div>
                      <div className="px-6 py-4">
                        <span className="text-xs text-gray-400 block mb-1">접수 일시</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(detail.receivedAt)}
                        </span>
                      </div>
                    </div>

                    {/* 대화 히스토리 (isSeller 변수를 같이 넘겨서 나를 구분하게 함) */}
                    <div className="px-6 py-6 bg-gray-50/50">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
                        진행 및 답변 이력
                      </h4>

                      <div className="space-y-4">
                        <ResponseBubble
                          role="BUYER"
                          content={detail.buyerClaim}
                          createdAt={detail.receivedAt}
                          isSellerPage={isSeller}
                          initial
                        />

                        {detail.responses.map((response) => (
                          <ResponseBubble
                            key={response.responseId}
                            role={response.responderRole}
                            content={response.content}
                            createdAt={response.createdAt}
                            isSellerPage={isSeller}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="px-6 py-5 bg-white border-t border-gray-200">
                      {canReply ? (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label htmlFor="reply-input" className="text-sm font-semibold text-gray-800">
                              {isSeller ? "바이어에게 답변 작성" : "판매사에게 추가 답변 작성"}
                            </label>
                            <span className="text-xs text-gray-400">{reply.length}/3000자</span>
                          </div>
                          <textarea
                            id="reply-input"
                            rows={4}
                            value={reply}
                            onChange={(e) => setReply(e.target.value.slice(0, 3000))}
                            placeholder="명확하고 친절한 해결 방안이나 답변 내용을 작성해 주세요."
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border outline-none resize-none"
                          />

                          {detailError && (
                            <div className="mt-3 p-3 rounded-md bg-rose-50 border border-rose-100 text-xs font-medium text-rose-700">
                              {detailError}
                            </div>
                          )}

                          <div className="mt-4 flex flex-wrap justify-end gap-2.5">
                            {!isSeller && detail.status === "WAITING_BUYER" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void resolveDispute()}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors"
                                >
                                  판매사 조치 수락
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsAdminModalOpen(true)}
                                  className="inline-flex items-center px-4 py-2 border border-amber-300 text-sm font-semibold rounded-md shadow-sm text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none transition-colors"
                                >
                                  관리자 검토 요청
                                </button>
                              </>
                            )}
                            <button
                              type="button"
                              onClick={() => void submitReply()}
                              disabled={isSubmitting || reply.trim().length === 0}
                              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-semibold rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              <Send className="h-4 w-4 mr-1.5" />
                              {isSubmitting ? "등록 중..." : "답변 등록"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-600">
                          <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                          <div className="font-medium">
                            {getWaitingMessage(detail.status, isSeller)}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : null}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 관리자 검토 요청 모달 */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity backdrop-blur-sm"
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminReason("");
              }}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 border border-gray-200">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100">
                  <ShieldAlert className="h-6 w-6 text-amber-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    관리자 검토 요청 사유 작성
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      판매사의 답변이나 해결 조치로 문제가 해결되지 않은 구체적인 사유를 작성해주세요. 플랫폼 관리자가 중재 및 검토를 시작합니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <textarea
                  rows={5}
                  value={adminReason}
                  onChange={(e) => setAdminReason(e.target.value)}
                  placeholder="예: 재배송 프로세스로 진행되었으나 온 상품에 여전히 동일 결함이 확인되어 중재 조치를 요청합니다."
                  className="shadow-sm focus:ring-amber-500 focus:border-amber-500 block w-full sm:text-sm border-gray-300 rounded-md p-3 border outline-none resize-none"
                />
              </div>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:flow-row-start">
                <button
                  type="button"
                  onClick={() => void requestAdminReview()}
                  disabled={adminReason.trim().length === 0}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-amber-600 text-sm font-semibold text-white hover:bg-amber-700 focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  검토 요청 제출
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setAdminReason("");
                  }}
                  className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  취소
                </button>
              </div>
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
  bgClass,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgClass: string;
}) {
  return (
    <div className={`${bgClass} overflow-hidden shadow rounded-lg border border-gray-200`}>
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: DisputeStatus }) {
  const config = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${config.className}`}
    >
      {config.label}
    </span>
  );
}

/* ==========================================================================
   수정된 대화 버블 컴포넌트 (좌우 반전 및 나/상대방 색상 강조 로직 반영)
   ========================================================================== */
function ResponseBubble({
  role,
  content,
  createdAt,
  isSellerPage,
  initial = false,
}: {
  role: ResponderRole;
  content: string;
  createdAt: string;
  isSellerPage: boolean;
  initial?: boolean;
}) {
  const isAdmin = role === "ADMIN";

  // 현재 페이지 주인(=나) 인지 판별하는 플래그
  // 바이어페이지인데 바이어가 쓴 글이거나, 셀러페이지인데 셀러가 쓴 글이면 "나" 임
  const isMe = (!isSellerPage && role === "BUYER") || (isSellerPage && role === "SELLER");

  return (
    <div className={`flex gap-3 items-start w-full ${
      isAdmin ? "justify-start" : isMe ? "flex-row-reverse" : "flex-row"
    }`}>
      {/* 프로필 아바타 (관리자 글이거나 내가 아닐 때만 노출하여 더욱 메신저 느낌 구현) */}
      {!isMe && (
        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border ${
          isAdmin ? "bg-amber-100 border-amber-200 text-amber-700" :
          role === "BUYER" ? "bg-blue-100 border-blue-200 text-blue-700" : "bg-purple-100 border-purple-200 text-purple-700"
        }`}>
          <User className="h-4 w-4" />
        </div>
      )}

      {/* 말풍선 바디 */}
      <div className={`max-w-[85%] rounded-lg p-4 shadow-sm border ${
        isAdmin ? "bg-amber-50/70 border-amber-200" :
        isMe ? "bg-indigo-600 border-indigo-600 text-white" : "bg-white border-gray-200 text-gray-700"
      }`}>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
          <span className={`text-xs font-bold ${isMe ? "text-indigo-100" : "text-gray-900"}`}>
            {ROLE_LABELS[role]} {isMe && "(나)"}
            <span className={`text-[11px] font-normal ml-1 ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
              {initial ? "최초 접수 내용" : "답변 피드백"}
            </span>
          </span>
          <span className={`text-[11px] font-medium ${isMe ? "text-indigo-200" : "text-gray-400"}`}>
            {formatDate(createdAt)}
          </span>
        </div>
        <p className={`whitespace-pre-wrap text-sm leading-6 font-normal ${isMe ? "text-white" : "text-gray-700"}`}>
          {content}
        </p>
      </div>
    </div>
  );
}

function getWaitingMessage(status: DisputeStatus, isSeller: boolean) {
  if (status === "RESOLVED") return "처리가 완료된 이의제기입니다.";
  if (status === "REJECTED") return "관리자 검토 후 기각된 이의제기입니다.";
  if (status === "CANCELED") return "취소된 이의제기입니다.";
  if (status === "REVIEWING") return "관리자가 내용을 중재 검토하고 있습니다. 조금만 기다려주세요.";
  if (status === "WAITING_BUYER") {
    return isSeller
      ? "바이어의 추가 조치 수락 또는 답변을 기다리고 있습니다."
      : "판매사의 답변이 접수되었습니다. 처리 방안을 확인하신 후 수락하거나 추가 의견을 등록해 주세요.";
  }
  if (status === "WAITING_SELLER" || status === "RECEIVED") {
    return isSeller
      ? "새로운 이의제기가 도달했습니다. 세부 내용을 검토하신 후 적절한 안내 및 피드백 답변을 작성해 주세요."
      : "판매사의 공식 답변을 기다리고 있습니다.";
  }
  return "현재 처리 프로세스를 확인해 주세요.";
}