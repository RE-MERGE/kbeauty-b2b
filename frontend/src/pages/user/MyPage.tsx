import { useState, type JSX } from "react";
import {
  User, ShieldCheck, Clock, Bell, Ban,
  Heart, ChevronRight, Building2, Mail,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { ProfileTab }         from "./ProfileTab";
import { SecurityTab }        from "./SecurityTab";
import { LoginHistoryTab }    from "./LoginHistoryTab";
import { NotificationTab }    from "./NotificationTab";
import { BlockTab }           from "./BlockTab";
import { ProductActivityTab } from "./ProductActivityTab";
// import { CompanyTab }         from "./CompanyTab";

// ── Types ─────────────────────────────────────────────────────────────────────

export type TabId =
    | "profile"
    | "security"
    | "login-history"
    | "notifications"
    | "blocks"
    | "product-activity"
    | "company";

interface NavGroup {
  label: string;
  items: { id: TabId; label: string; icon: JSX.Element }[];
}

// ── Nav config ────────────────────────────────────────────────────────────────
// 요청 순서: 최근상품 → 내 정보 → 보안 → 로그인 기록 → 회사 정보
// (알림/차단 설정은 기존 기능 유지를 위해 "설정" 그룹으로 하단에 보존)

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
      { id: "profile",       label: "내 정보",    icon: <User size={15} /> },
      { id: "security",      label: "보안",         icon: <ShieldCheck size={15} /> },
      { id: "login-history", label: "로그인 기록",  icon: <Clock size={15} /> },
    ],
  },
  {
    label: "회사",
    items: [
      { id: "company", label: "회사 정보", icon: <Building2 size={15} /> },
    ],
  },
  {
    label: "설정",
    items: [
      { id: "notifications", label: "알림 설정", icon: <Bell size={15} /> },
      { id: "blocks",        label: "차단 관리", icon: <Ban size={15} /> },
    ],
  },
];

// ── Profile Card (sidebar 상단) ────────────────────────────────────────────────

function ProfileCard() {
  const user = useAuthStore((state) => state.user);

  const name    = user?.name ?? "사용자";
  const email   = user?.email ?? "";
  const initials = name.slice(0, 2);

  const roleLabel =
      user?.businessRole === "BUYER"  ? "바이어" :
          user?.businessRole === "SELLER" ? "셀러"   :
              user?.businessRole === "BOTH"   ? "바이어 · 셀러" : null;

  return (
      <div className="bg-white border border-border rounded-xl p-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary font-black text-base flex items-center justify-center overflow-hidden flex-shrink-0">
            {user?.profileImageUrl ? (
                <img src={user.profileImageUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
                initials
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-bold text-foreground truncate">{name}</p>
              {roleLabel && (
                  <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                {roleLabel}
              </span>
              )}
            </div>
            <p className="flex items-center gap-1 text-xs text-muted-foreground truncate mt-0.5">
              <Mail size={11} className="flex-shrink-0" />
              {email}
            </p>
          </div>
        </div>

        {user?.companyId && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
              <Building2 size={12} />
              <span className="truncate">{(user as any).companyName ?? "소속 회사"}</span>
            </div>
        )}
      </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function MyPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/*<h1 className="text-2xl font-bold text-foreground mb-6">마이페이지</h1>*/}

        <div className="flex gap-6 items-start">
          {/* ── Sidebar ── */}
          <nav className="w-52 shrink-0">
            <ProfileCard />

            <div className="space-y-5">
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
            </div>
          </nav>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0 bg-white border border-border rounded-xl p-6">
            {activeTab === "profile"          && <ProfileTab />}
            {activeTab === "security"         && <SecurityTab />}
            {activeTab === "login-history"    && <LoginHistoryTab />}
            {activeTab === "notifications"    && <NotificationTab />}
            {activeTab === "blocks"           && <BlockTab />}
            {activeTab === "product-activity" && <ProductActivityTab />}
            {/*{activeTab === "company"          && <CompanyTab />}*/}
          </div>
        </div>
      </div>
  );
}