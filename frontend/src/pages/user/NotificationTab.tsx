import { useState } from "react";
import { Bell, ShoppingBag, MessageSquare, Tag, Shield, Mail, Smartphone } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Channel = "email" | "push";

interface NotifSetting {
    id: string;
    label: string;
    desc: string;
    email: boolean;
    push: boolean;
}

interface NotifGroup {
    groupId: string;
    label: string;
    icon: React.ReactNode;
    items: NotifSetting[];
}

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_GROUPS: NotifGroup[] = [
    {
        groupId: "order",
        label: "주문 · 배송",
        icon: <ShoppingBag size={14} />,
        items: [
            { id: "order_status",    label: "주문 상태 변경",    desc: "주문 확인, 출고, 배송 완료 시",  email: true,  push: true  },
            { id: "order_cancel",    label: "주문 취소 · 반품",  desc: "취소 승인 및 환불 처리 시",       email: true,  push: true  },
            { id: "shipping_update", label: "배송 추적 업데이트", desc: "운송장 등록 및 배송 단계 변경 시", email: false, push: true  },
        ],
    },
    {
        groupId: "inquiry",
        label: "문의 · 메시지",
        icon: <MessageSquare size={14} />,
        items: [
            { id: "inquiry_reply",   label: "문의 답변",          desc: "관리자가 답변을 등록했을 때",     email: true,  push: true  },
            { id: "inquiry_closed",  label: "문의 종료",           desc: "문의방이 종료됐을 때",            email: false, push: false },
        ],
    },
    {
        groupId: "marketing",
        label: "혜택 · 마케팅",
        icon: <Tag size={14} />,
        items: [
            { id: "promotion",       label: "프로모션 · 할인",    desc: "특가 행사 및 쿠폰 발급 시",       email: true,  push: false },
            { id: "new_product",     label: "신상품 알림",         desc: "관심 카테고리 신상품 등록 시",     email: false, push: false },
            { id: "newsletter",      label: "뉴스레터",            desc: "주간 트렌드 리포트",              email: true,  push: false },
        ],
    },
    {
        groupId: "security",
        label: "보안",
        icon: <Shield size={14} />,
        items: [
            { id: "login_alert",     label: "새 기기 로그인 알림", desc: "새 기기에서 로그인 감지 시",      email: true,  push: true  },
            { id: "pw_change",       label: "비밀번호 변경 알림",  desc: "비밀번호 변경 완료 시",           email: true,  push: true  },
        ],
    },
];

// ── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 transition-colors ${
                checked ? "bg-primary border-primary" : "bg-muted border-border"
            }`}
        >
      <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-4" : "translate-x-0.5"
          }`}
      />
        </button>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function NotificationTab() {
    const [groups, setGroups] = useState<NotifGroup[]>(INITIAL_GROUPS);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved]   = useState(false);

    const setItem = (
        groupId: string,
        itemId: string,
        channel: Channel,
        value: boolean,
    ) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.groupId !== groupId ? g : {
                    ...g,
                    items: g.items.map((item) =>
                        item.id !== itemId ? item : { ...item, [channel]: value },
                    ),
                },
            ),
        );
    };

    // Toggle all items in a group for a channel
    const toggleGroup = (groupId: string, channel: Channel, value: boolean) => {
        setGroups((prev) =>
            prev.map((g) =>
                g.groupId !== groupId ? g : {
                    ...g,
                    items: g.items.map((item) => ({ ...item, [channel]: value })),
                },
            ),
        );
    };

    const handleSave = () => {
        setSaving(true);
        // TODO: PUT /users/me/notification-settings
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }, 800);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-1">
                    <Bell size={16} className="text-primary" /> 알림 설정
                </h2>
                <p className="text-xs text-muted-foreground">
                    받고 싶은 알림과 채널을 선택하세요.
                </p>
            </div>

            {/* Channel header */}
            <div className="flex items-center justify-end gap-6 pr-1">
                {(["email", "push"] as Channel[]).map((ch) => (
                    <div key={ch} className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground w-14 justify-center">
                        {ch === "email" ? <Mail size={12} /> : <Smartphone size={12} />}
                        {ch === "email" ? "이메일" : "푸시"}
                    </div>
                ))}
            </div>

            {/* Groups */}
            <div className="space-y-5">
                {groups.map((group) => {
                    const allEmail = group.items.every((i) => i.email);
                    const allPush  = group.items.every((i) => i.push);

                    return (
                        <section key={group.groupId} className="border border-border rounded-xl overflow-hidden">
                            {/* Group header */}
                            <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <span className="text-primary">{group.icon}</span>
                                    {group.label}
                                </div>
                                <div className="flex items-center gap-6 pr-1">
                                    <Toggle
                                        checked={allEmail}
                                        onChange={(v) => toggleGroup(group.groupId, "email", v)}
                                    />
                                    <Toggle
                                        checked={allPush}
                                        onChange={(v) => toggleGroup(group.groupId, "push", v)}
                                    />
                                </div>
                            </div>

                            {/* Items */}
                            <div className="divide-y divide-border/60">
                                {group.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between px-4 py-3.5"
                                    >
                                        <div className="min-w-0 mr-4">
                                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                        </div>
                                        <div className="flex items-center gap-6 shrink-0 pr-1">
                                            <Toggle
                                                checked={item.email}
                                                onChange={(v) => setItem(group.groupId, item.id, "email", v)}
                                            />
                                            <Toggle
                                                checked={item.push}
                                                onChange={(v) => setItem(group.groupId, item.id, "push", v)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </div>

            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
            >
                {saving ? (
                    <><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />저장 중...</>
                ) : saved ? "✓ 저장되었습니다" : "설정 저장"}
            </button>
        </div>
    );
}