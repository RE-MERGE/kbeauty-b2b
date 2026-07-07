import { useEffect, useState } from "react";
import { AlertCircle, ChevronRight, Scale } from "lucide-react";
import { Link } from "react-router";
import api from "@/api/axios";

type DisputeStatus =
  | "RECEIVED"
  | "REVIEWING"
  | "WAITING_SELLER"
  | "WAITING_BUYER"
  | "RESOLVED"
  | "REJECTED"
  | "CANCELED";

type DashboardDispute = {
  disputeId: number;
  orderNo: string;
  title: string;
  status: DisputeStatus;
  buyerClaim: string;
  receivedAt: string;
};

const STATUS_LABEL: Record<DisputeStatus, string> = {
  RECEIVED: "접수 완료",
  REVIEWING: "관리자 검토 중",
  WAITING_SELLER: "판매사 답변 필요",
  WAITING_BUYER: "바이어 답변 필요",
  RESOLVED: "처리 완료",
  REJECTED: "기각",
  CANCELED: "취소",
};

export function LiveDisputePanel({
  role,
}: {
  role: "buyer" | "seller";
}) {
  const [disputes, setDisputes] = useState<DashboardDispute[]>([]);
  const endpoint =
    role === "seller"
      ? "/seller/orders/disputes"
      : "/buyer/orders/disputes";
  const pagePath =
    role === "seller" ? "/seller/disputes" : "/buyer/disputes";

  useEffect(() => {
    const loadDisputes = async () => {
      try {
        const response = await api.get<DashboardDispute[]>(endpoint);
        setDisputes(response);
      } catch (error) {
        console.error("대시보드 이의제기 조회 실패", error);
      }
    };

    const handleFocus = () => {
      void loadDisputes();
    };

    void loadDisputes();
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [endpoint]);

  if (disputes.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Scale size={15} className="text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">이의제기</span>
        </div>
        <p className="py-6 text-center text-xs text-muted-foreground">
          처리 중인 이의제기가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-red-200 bg-white">
      <div className="flex items-center justify-between border-b border-red-100 bg-red-50/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <Scale size={15} className="text-red-500" />
          <span className="text-sm font-bold text-red-800">이의제기</span>
          <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-bold text-white">
            {disputes.length}
          </span>
        </div>
        <Link
          to={pagePath}
          className="flex items-center gap-1 text-xs text-red-600 transition-colors hover:text-red-800"
        >
          전체 보기 <ChevronRight size={12} />
        </Link>
      </div>

      <div className="divide-y divide-border">
        {disputes.slice(0, 3).map((dispute) => {
          const needsMyReply =
            role === "seller"
              ? dispute.status === "RECEIVED" ||
                dispute.status === "WAITING_SELLER"
              : dispute.status === "WAITING_BUYER";

          return (
            <Link
              key={dispute.disputeId}
              to={`${pagePath}/${dispute.disputeId}`}
              className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-red-50/30"
            >
              <AlertCircle
                size={14}
                className="shrink-0 text-red-400"
              />
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {dispute.title}
                  </p>
                  {needsMyReply && (
                    <span className="shrink-0 rounded border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">
                      답변 필요
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {dispute.orderNo} · {STATUS_LABEL[dispute.status]}
                </p>
              </div>
              <ChevronRight
                size={13}
                className="shrink-0 text-muted-foreground/30 transition-colors group-hover:text-foreground"
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
