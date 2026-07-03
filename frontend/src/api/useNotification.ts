import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

interface NotificationMessage {
  type: string;
  message: string;
  referenceId?: number;
  referenceType?: string;
  targetUserId?: number;
  targetCompanyId?: number;
  targetRole?: string;
}

const NOTIFICATION_ICONS: Record<string, string> = {
  // 소싱
  SOURCING_ASSIGNED:          "📦",
  QUOTE_RECEIVED:             "📩",
  QUOTE_APPROVED:             "✅",
  QUOTE_REJECTED:             "❌",
  QUOTE_NEGOTIATING:          "💬",
  SAMPLE_REQUESTED:           "🧪",
  // 주문/배송
  ORDER_CONFIRMED:            "🛒",
  ORDER_SHIPPED:              "🚚",
  ORDER_DELIVERED:            "📫",
  // 계약
  CONTRACT_CREATED:           "📋",
  CONTRACT_SIGNED:            "✍️",
  // 관리자
  USER_JOINED:                "👤",
  COMPANY_APPROVAL_REQUESTED: "🏢",
  SOURCING_CREATED:           "📝",
  DISPUTE_RAISED:             "⚠️",
};

// JWT 쿠키 기반 — userId 파라미터 불필요
// withCredentials 옵션이 없는 EventSource는 쿠키를 안 보내서
// 커스텀 fetch + ReadableStream 방식 대신 withCredentials 지원하는 방식 사용
export function useNotification(b: boolean) {
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource(
        `${import.meta.env.VITE_API_URL}/api/notifications/subscribe`,
        { withCredentials: true }  // JWT 쿠키 포함
    );
    esRef.current = es;

    es.addEventListener("connect", () => {
      console.log("SSE connected");
    });

    es.addEventListener("notification", (e) => {
      try {
        const data: NotificationMessage = JSON.parse(e.data);
        toast(data.message, {
          icon: NOTIFICATION_ICONS[data.type] ?? "🔔",
          duration: 4000,
        });
      } catch {
        console.error("Failed to parse notification", e.data);
      }
    });

    es.onerror = () => {
      console.warn("SSE connection error, retrying...");
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, []); // 마운트 시 1회만 — 로그인 상태는 쿠키가 보장
}