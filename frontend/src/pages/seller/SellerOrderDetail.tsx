import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  Clock,
  CreditCard,
  History,
  MapPin,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import api from "@/api/axios";
import { useAuthStore } from "@/store/useAuthStore";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PREPARING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTE"
  | "CANCELED"
  | "REFUNDED";

type SellerOrderItemResponse = {
  orderItemId: number;
  productName: string;
  optionSummary: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productImageUrl: string | null;
  itemStatus: "WAITING" | "READY";
  preparedAt: string | null;
};

type PaymentMethod = "TRANSFER" | "CORP_CARD";
type OrderLogType = "STATUS" | "PROCESS";

type SellerOrderAmountResponse = {
  subtotalAmount: number;
  shippingFee: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod | null;
};

type SellerOrderDeliveryResponse = {
  receiverName: string;
  receiverPhone: string;
  receiverZipcode: string | null;
  receiverAddress: string;
  receiverAddressDetail: string | null;
  receiverMemo: string | null;
  carrier: string | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
};

type SellerOrderLogResponse = {
  orderLogId: number;
  logType: OrderLogType;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus | null;
  processStep: string | null;
  actorName: string;
  memo: string | null;
  createdAt: string;
};

type SellerOrderDetailResponse = {
  orderId: number;
  orderNo: string;
  buyerCompanyName: string;
  orderStatus: OrderStatus;
  isSample: boolean;
  items: SellerOrderItemResponse[];
  createdAt: string;
  amountSummary: SellerOrderAmountResponse;
  delivery: SellerOrderDeliveryResponse;
  statusLogs: SellerOrderLogResponse[];
  preparation: {
    totalItemCount: number;
    readyItemCount: number;
    allItemsReady: boolean;
  };
};

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string; icon: ReactNode }
> = {
  PENDING: {
    label: "결제 대기",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: <Clock size={14} />,
  },
  CONFIRMED: {
    label: "결제 완료",
    className: "border-blue-200 bg-blue-50 text-blue-700",
    icon: <CheckCircle size={14} />,
  },
  PREPARING: {
    label: "출고 준비",
    className: "border-purple-200 bg-purple-50 text-purple-700",
    icon: <Package size={14} />,
  },
  SHIPPED: {
    label: "배송 중",
    className: "border-primary/20 bg-secondary text-primary",
    icon: <Truck size={14} />,
  },
  DELIVERED: {
    label: "배송 완료",
    className: "border-green-200 bg-green-50 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  COMPLETED: {
    label: "거래 완료",
    className: "border-green-200 bg-green-50 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  DISPUTE: {
    label: "이의제기",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <AlertCircle size={14} />,
  },
  CANCELED: {
    label: "주문 취소",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: <XCircle size={14} />,
  },
  REFUNDED: {
    label: "환불 완료",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: <CheckCircle size={14} />,
  },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const paymentMethodLabel: Record<PaymentMethod, string> = {
  TRANSFER: "무통장 입금",
  CORP_CARD: "법인카드",
};

const normalOrderStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "COMPLETED",
];

const exceptionStatuses: OrderStatus[] = [
  "DISPUTE",
  "CANCELED",
  "REFUNDED",
];

export function SellerOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const user = useAuthStore((state) => state.user);
  const [order, setOrder] = useState<SellerOrderDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [isUpdatingAll, setIsUpdatingAll] = useState(false);
  const [actionNotice, setActionNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const loadOrderDetail = useCallback(
    async (showLoading = true) => {
      if (!id) {
        setLoadError("주문 번호가 올바르지 않습니다.");
        setIsLoading(false);
        return;
      }

      try {
        if (showLoading) {
          setIsLoading(true);
        }
        setLoadError("");
        const response = await api.get<SellerOrderDetailResponse>(
          `/seller/orders/${id}`
        );
        setOrder(response);
      } catch (error) {
        console.error("셀러 주문 상세 조회 실패", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "주문 상세를 불러오지 못했습니다."
        );
      } finally {
        if (showLoading) {
          setIsLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    void loadOrderDetail();
  }, [loadOrderDetail]);

  const handleMarkItemReady = async (orderItemId: number) => {
    try {
      setUpdatingItemId(orderItemId);
      setActionNotice(null);
      await api.patch(`/seller/orders/items/${orderItemId}/ready`);
      await loadOrderDetail(false);
      setActionNotice({
        type: "success",
        message: "담당 상품을 준비 완료 처리했습니다.",
      });
    } catch (error) {
      setActionNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "상품 준비 상태를 변경하지 못했습니다.",
      });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleMarkAllItemsReady = async () => {
    if (!id) return;

    try {
      setIsUpdatingAll(true);
      setActionNotice(null);
      await api.patch(`/seller/orders/${id}/items/ready`);
      await loadOrderDetail(false);
      setActionNotice({
        type: "success",
        message: "주문의 모든 상품을 준비 완료 처리했습니다.",
      });
    } catch (error) {
      setActionNotice({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "전체 상품 준비 상태를 변경하지 못했습니다.",
      });
    } finally {
      setIsUpdatingAll(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-16 text-center text-sm text-muted-foreground">
        주문 상세를 불러오는 중입니다.
      </div>
    );
  }

  if (loadError || !order) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-16 text-center">
        <AlertCircle
          size={42}
          className="mx-auto mb-4 text-muted-foreground/50"
        />
        <h2 className="mb-2 text-lg font-bold text-foreground">
          주문 상세를 불러오지 못했습니다.
        </h2>
        <p className="mb-5 text-sm text-muted-foreground">{loadError}</p>
        <Link
          to="/seller/orders"
          className="inline-flex rounded bg-primary px-5 py-2.5 text-sm font-semibold text-white"
        >
          주문 목록으로
        </Link>
      </div>
    );
  }

  const status = statusConfig[order.orderStatus];
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
  const currentNormalStatusIndex = normalOrderStatuses.indexOf(
    order.orderStatus
  );
  const isPresident = user?.role === "PRESIDENT";
  const isEmployee = user?.role === "EMPLOYEE";
  const canPrepareItems =
    order.orderStatus === "CONFIRMED" || order.orderStatus === "PREPARING";
  const exceptionLogs = order.statusLogs.filter(
    (log) => log.newStatus && exceptionStatuses.includes(log.newStatus)
  );

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-8">
      <Link
        to="/seller/orders"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        <ChevronLeft size={15} />
        주문 목록으로
      </Link>

      <section className="mb-5 rounded-lg bg-[#24352d] px-6 py-5 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded border border-white/25 px-2 py-1 text-xs">
                {order.isSample ? "샘플 주문" : "일반 주문"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-semibold ${status.className}`}
              >
                {status.icon}
                {status.label}
              </span>
            </div>
            <h1 className="font-mono text-xl font-bold">{order.orderNo}</h1>
            <p className="mt-2 text-sm text-white/65">
              구매 회사 {order.buyerCompanyName} · 주문일{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold">
              {order.amountSummary.totalAmount.toLocaleString()}원
            </p>
            <p className="mt-1 text-xs text-white/65">
              총 {totalQuantity.toLocaleString()}개
            </p>
          </div>
        </div>
      </section>

      {actionNotice && (
        <div
          className={`mb-5 flex items-center justify-between gap-3 border px-4 py-3 text-sm font-semibold ${
            actionNotice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          <span>{actionNotice.message}</span>
          <button
            type="button"
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold"
          >
            닫기
          </button>
        </div>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-lg border border-border bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="flex items-center gap-2 font-bold text-foreground">
                  <Package size={17} className="text-primary" />
                  주문 상품
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  준비 완료 {order.preparation.readyItemCount} /{" "}
                  {order.preparation.totalItemCount}
                  {order.preparation.allItemsReady
                    ? " · 모든 상품 준비 완료"
                    : " · 출고 준비 진행 중"}
                </p>
              </div>
              {isPresident &&
                canPrepareItems &&
                !order.preparation.allItemsReady && (
                  <button
                    type="button"
                    disabled={isUpdatingAll}
                    onClick={() => void handleMarkAllItemsReady()}
                    className="h-9 bg-primary px-3 text-xs font-bold text-white transition hover:bg-primary/90 disabled:cursor-wait disabled:opacity-60"
                  >
                    {isUpdatingAll ? "처리 중" : "전체 준비 완료"}
                  </button>
                )}
            </div>

            {order.items.length === 0 ? (
              <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                조회된 주문 상품이 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {order.items.map((item) => (
                  <article
                    key={item.orderItemId}
                    className="grid gap-4 px-5 py-5 sm:grid-cols-[88px_minmax(0,1fr)_120px]"
                  >
                    <div className="flex h-[88px] w-[88px] items-center justify-center overflow-hidden rounded border border-border bg-muted/40">
                      {item.productImageUrl ? (
                        <img
                          src={item.productImageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package
                          size={28}
                          className="text-muted-foreground/40"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground">
                        {item.productName}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.optionSummary || "기본 옵션"}
                      </p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {item.quantity.toLocaleString()}개 x{" "}
                        {item.unitPrice.toLocaleString()}원
                      </p>
                    </div>
                    <div className="self-center text-left sm:text-right">
                      <span
                        className={`mb-2 inline-flex border px-2 py-1 text-xs font-semibold ${
                          item.itemStatus === "READY"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-slate-200 bg-slate-50 text-slate-500"
                        }`}
                      >
                        {item.itemStatus === "READY"
                          ? "준비 완료"
                          : "준비 전"}
                      </span>
                      <p className="font-bold text-foreground">
                        {item.totalPrice.toLocaleString()}원
                      </p>
                      {item.preparedAt && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(item.preparedAt)}
                        </p>
                      )}
                      {isEmployee &&
                        canPrepareItems &&
                        item.itemStatus !== "READY" && (
                          <button
                            type="button"
                            disabled={updatingItemId === item.orderItemId}
                            onClick={() =>
                              void handleMarkItemReady(item.orderItemId)
                            }
                            className="mt-3 h-8 border border-primary px-2.5 text-xs font-bold text-primary transition hover:bg-secondary disabled:cursor-wait disabled:opacity-60"
                          >
                            {updatingItemId === item.orderItemId
                              ? "처리 중"
                              : "준비 완료"}
                          </button>
                        )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border bg-white">
            <div className="border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-bold text-foreground">
                <History size={17} className="text-primary" />
                주문 진행 현황
              </h2>
            </div>
            <ol className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">
              {normalOrderStatuses.map((step, index) => {
                const stepLog = order.statusLogs.find(
                  (log) => log.newStatus === step
                );
                const isCompleted =
                  index === 0 ||
                  (currentNormalStatusIndex >= 0 &&
                    index <= currentNormalStatusIndex) ||
                  Boolean(stepLog);
                const isCurrent = order.orderStatus === step;

                return (
                  <li
                    key={step}
                    className={`min-h-[108px] border p-3 ${
                      isCompleted
                        ? "border-primary/25 bg-secondary/60"
                        : "border-border bg-muted/20"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          isCompleted
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle size={14} />
                        ) : (
                          <Clock size={14} />
                        )}
                      </span>
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {statusConfig[step].label}
                        {isCurrent && (
                          <span className="ml-1.5 text-xs text-primary">
                            현재
                          </span>
                        )}
                      </p>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {stepLog
                        ? formatDate(stepLog.createdAt)
                        : index === 0
                          ? formatDate(order.createdAt)
                          : "진행 전"}
                    </p>
                    {stepLog && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {stepLog.actorName}
                        {stepLog.memo ? ` · ${stepLog.memo}` : ""}
                      </p>
                    )}
                  </li>
                );
              })}
            </ol>

            {exceptionLogs.length > 0 && (
              <div className="border-t border-border px-5 py-4">
                <p className="mb-3 text-xs font-semibold text-red-700">
                  예외 처리 이력
                </p>
                <div className="space-y-2">
                  {exceptionLogs.map((log) => (
                    <div
                      key={log.orderLogId}
                      className="flex flex-wrap items-center justify-between gap-2 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                    >
                      <span className="font-semibold">
                        {log.newStatus
                          ? statusConfig[log.newStatus].label
                          : "예외 처리"}
                      </span>
                      <span>
                        {formatDate(log.createdAt)} · {log.actorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
              <CreditCard size={17} className="text-primary" />
              결제 요약
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">상품 금액</dt>
                <dd>{order.amountSummary.subtotalAmount.toLocaleString()}원</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">배송비</dt>
                <dd>{order.amountSummary.shippingFee.toLocaleString()}원</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">플랫폼 수수료</dt>
                <dd>{order.amountSummary.platformFee.toLocaleString()}원</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">결제 수단</dt>
                <dd>
                  {order.amountSummary.paymentMethod
                    ? paymentMethodLabel[order.amountSummary.paymentMethod]
                    : "미등록"}
                </dd>
              </div>
              <div className="flex justify-between gap-3 border-t border-border pt-3">
                <dt className="font-semibold text-foreground">최종 금액</dt>
                <dd className="font-bold text-primary">
                  {order.amountSummary.totalAmount.toLocaleString()}원
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 font-bold text-foreground">
              <MapPin size={17} className="text-primary" />
              배송 정보
            </h2>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="mb-1 text-xs text-muted-foreground">수령인</dt>
                <dd className="font-medium">
                  {order.delivery.receiverName} · {order.delivery.receiverPhone}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-muted-foreground">배송지</dt>
                <dd className="leading-6">
                  {order.delivery.receiverZipcode &&
                    `[${order.delivery.receiverZipcode}] `}
                  {order.delivery.receiverAddress}{" "}
                  {order.delivery.receiverAddressDetail}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-muted-foreground">
                  배송 요청사항
                </dt>
                <dd>{order.delivery.receiverMemo || "요청사항 없음"}</dd>
              </div>
              <div className="border-t border-border pt-3">
                <dt className="mb-1 text-xs text-muted-foreground">
                  운송 정보
                </dt>
                <dd>
                  {order.delivery.carrier && order.delivery.trackingNumber
                    ? `${order.delivery.carrier} ${order.delivery.trackingNumber}`
                    : "운송장 미등록"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
