import api from "@/api/axios";

// 백엔드 Notification 엔티티 필드 기준
export interface NotificationResponse {
    notificationId: number;
    type: string;
    message: string;
    referenceId: number | null;
    referenceType: string | null;
    targetUserId: number | null;
    targetCompanyId: number | null;
    targetRole: string | null;
    isRead: boolean;
    createdAt: string;
}

// ───────────────────────────────────────────
// 알림
// ───────────────────────────────────────────

export const getNotifications = async (): Promise<NotificationResponse[]> => {
    return await api.get<NotificationResponse[]>("/notifications");
};

export const getUnreadCount = async (): Promise<number> => {
    return await api.get<number>("/notifications/unread-count");
};

export const markAsRead = async (notificationId: number): Promise<void> => {
    await api.patch<void>(`/notifications/${notificationId}/read`);
};

export const markAllAsRead = async (): Promise<void> => {
    await api.patch<void>("/notifications/read-all");
};
