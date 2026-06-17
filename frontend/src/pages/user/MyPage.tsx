import { useState, type JSX } from "react";
import {
  User, ShieldCheck, Clock, Bell, Ban,
  Heart, ChevronRight,
} from "lucide-react";
import { ProfileTab }         from "./ProfileTab";
import { SecurityTab }        from "./SecurityTab";
import { LoginHistoryTab }    from "./LoginHistoryTab";
import { NotificationTab }    from "./NotificationTab";
import { BlockTab }           from "./BlockTab";
import { ProductActivityTab } from "./ProductActivityTab";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TabId =
    | "profile"
    | "security"
    | "login-history"
    | "notifications"
    | "blocks"
    | "product-activity";

interface NavGroup {
  label: string;
  items: { id: TabId; label: string; icon: JSX.Element }[];
}

// ── Nav config ────────────────────────────────────────────────────────────────

const NAV_GROUPS: NavGroup[] = [
  {
    label: "쇼핑 활동",
    items: [
      { id: "product-activity", label: "관심 · 최근 상품", icon: <Heart size={15} /> },
    ],
  },
  {
    label: "계정",
    items: [
      { id: "profile",       label: "내 정보",       icon: <User size={15} /> },
      { id: "security",      label: "보안",           icon: <ShieldCheck size={15} /> },
      { id: "login-history", label: "로그인 기록",    icon: <Clock size={15} /> },
    ],
  },
  {
    label: "설정",
    items: [
      { id: "notifications", label: "알림 설정",      icon: <Bell size={15} /> },
      { id: "blocks",        label: "차단 관리",      icon: <Ban size={15} /> },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function MyPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground mb-6">마이페이지</h1>

        <div className="flex gap-6 items-start">
          {/* ── Sidebar ── */}
          <nav className="w-52 shrink-0 space-y-5">
            {NAV_GROUPS.map((group) => (
                <div key={group.label}>
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-1">
                    {group.label}
                  </p>
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const active = activeTab === item.id;
                      return (
                          <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                  active
                                      ? "bg-primary text-white"
                                      : "text-foreground hover:bg-muted/50"
                              }`}
                          >
                      <span className={active ? "text-white" : "text-muted-foreground"}>
                        {item.icon}
                      </span>
                            <span className="flex-1 text-left">{item.label}</span>
                            {!active && (
                                <ChevronRight size={13} className="text-muted-foreground/40" />
                            )}
                          </button>
                      );
                    })}
                  </div>
                </div>
            ))}
          </nav>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0 bg-white border border-border rounded-xl p-6">
            {activeTab === "profile"          && <ProfileTab />}
            {activeTab === "security"         && <SecurityTab />}
            {activeTab === "login-history"    && <LoginHistoryTab />}
            {activeTab === "notifications"    && <NotificationTab />}
            {activeTab === "blocks"           && <BlockTab />}
            {activeTab === "product-activity" && <ProductActivityTab />}
          </div>
        </div>
      </div>
  );
}