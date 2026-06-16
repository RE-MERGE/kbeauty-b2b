import { useState } from "react";
import {
  UserPlus, Mail, Clock, CheckCircle, Ban,
  X, Search, ShieldCheck, Users,
} from "lucide-react";
import type { Member, MemberStatus, FilterTab } from "./types";
import {
  MOCK_MEMBERS,
  Avatar, RoleBadge, StatusDot, PanelCard, Toast,
  inputCls,
} from "./shared";

// ── InvitePanel ───────────────────────────────────────────────────────────────

function InvitePanel({ onClose, onInvite }: {
  onClose: () => void;
  onInvite: (email: string) => void;
}) {
  const [email, setEmail] = useState("");
  const invalid = !email.trim() || !email.includes("@");
  const submit  = () => { if (!invalid) { onInvite(email.trim()); setEmail(""); } };

  return (
    <div className="border border-primary/25 bg-primary/[0.03] rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserPlus size={14} className="text-primary" />
          <span className="text-sm font-semibold">직원 초대</span>
        </div>
        <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          <X size={14} />
        </button>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="초대할 이메일 주소"
          className={inputCls}
        />
        <button
          onClick={submit}
          disabled={invalid}
          className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
        >
          초대 보내기
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
        <ShieldCheck size={11} className="text-primary/50 shrink-0" />
        가입 완료 후 이 목록에 자동으로 추가됩니다.
      </p>
    </div>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────

function ActionButton({ member, onStatusChange, onResend }: {
  member: Member;
  onStatusChange: (id: string, s: MemberStatus) => void;
  onResend: (id: string) => void;
}) {
  if (member.role === "president")
    return <span className="text-xs text-muted-foreground/30">–</span>;

  if (member.status === "pending")
    return (
      <button onClick={() => onResend(member.id)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-primary/20 text-[11px] font-medium text-primary hover:bg-primary/5 transition-colors">
        <Mail size={10} /> 재발송
      </button>
    );

  if (member.status === "active")
    return (
      <button onClick={() => onStatusChange(member.id, "inactive")}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors">
        <Ban size={10} /> 비활성화
      </button>
    );

  return (
    <button onClick={() => onStatusChange(member.id, "active")}
      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-emerald-200 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors">
      <CheckCircle size={10} /> 활성화
    </button>
  );
}

// ── MembersTab ────────────────────────────────────────────────────────────────

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all",      label: "전체"     },
  { key: "active",   label: "활성"     },
  { key: "pending",  label: "초대 대기" },
  { key: "inactive", label: "비활성"   },
];

export function MembersTab() {
  const [members, setMembers]       = useState<Member[]>(MOCK_MEMBERS);
  const [filterTab, setFilterTab]   = useState<FilterTab>("all");
  const [search, setSearch]         = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [toast, setToast]           = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleInvite = (email: string) => {
    setMembers((prev) => [
      ...prev,
      {
        id: String(Date.now()), name: "", email,
        role: "employee", status: "pending",
        last_login_at: null,
        joinedAt: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(/\.$/, ""),
      },
    ]);
    setShowInvite(false);
    showToast(`${email}로 초대 메일을 발송했습니다.`);
  };

  const handleStatus = (id: string, status: MemberStatus) => {
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, status } : m));
    showToast(status === "active" ? "계정을 활성화했습니다." : "계정을 비활성화했습니다.");
  };

  const handleResend = (id: string) => {
    const m = members.find((m) => m.id === id);
    if (m) showToast(`${m.email}로 초대 메일을 재발송했습니다.`);
  };

  const stats = {
    total:    members.length,
    active:   members.filter((m) => m.status === "active").length,
    pending:  members.filter((m) => m.status === "pending").length,
    inactive: members.filter((m) => m.status === "inactive").length,
  };

  const filtered = members.filter((m) => {
    const matchTab    = filterTab === "all" || m.status === filterTab;
    const q           = search.trim().toLowerCase();
    const matchSearch = !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">직원을 초대하고 계정 상태를 관리하세요.</p>
        <button
          onClick={() => setShowInvite((v) => !v)}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <UserPlus size={13} /> 직원 초대
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "전체 인원", value: stats.total,    cls: "text-foreground"   },
          { label: "활성",      value: stats.active,   cls: "text-emerald-600"  },
          { label: "초대 대기", value: stats.pending,  cls: "text-amber-500"    },
          { label: "비활성",    value: stats.inactive, cls: "text-slate-400"    },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-border rounded-xl px-4 py-3.5">
            <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite panel */}
      {showInvite && (
        <InvitePanel onClose={() => setShowInvite(false)} onInvite={handleInvite} />
      )}

      {/* Pending notice */}
      {stats.pending > 0 && !showInvite && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
          <Clock size={13} className="shrink-0 text-amber-500" />
          초대 수락을 기다리는 직원이 <strong>{stats.pending}명</strong> 있습니다.
        </div>
      )}

      {/* Search + filter */}
      <div className="flex items-center gap-2">
        <div className="relative w-60">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="이름 또는 이메일"
            className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden text-xs ml-auto">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilterTab(t.key)}
              className={`px-3.5 py-2 font-semibold transition-colors whitespace-nowrap ${
                filterTab === t.key
                  ? "bg-primary text-white"
                  : "bg-white text-muted-foreground hover:text-foreground hover:bg-muted/20"
              }`}
            >
              {t.label}
              {t.key !== "all" && (
                <span className={`ml-1 ${filterTab === t.key ? "opacity-70" : ""}`}>
                  ({stats[t.key as keyof typeof stats]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <PanelCard title={`직원 ${filtered.length}명`} icon={<Users size={13} />} noPad>
        {/* thead */}
        <div className="grid grid-cols-[minmax(0,2.5fr)_90px_110px_140px_90px] gap-4 px-5 py-2.5 bg-muted/30 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          <span>이름 / 이메일</span>
          <span>역할</span>
          <span>상태</span>
          <span>최근 로그인</span>
          <span>관리</span>
        </div>

        {filtered.length === 0 ? (
          <div className="py-14 text-center text-sm text-muted-foreground">
            해당하는 직원이 없습니다.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((m) => (
              <div
                key={m.id}
                className={`grid grid-cols-[minmax(0,2.5fr)_90px_110px_140px_90px] gap-4 px-5 py-3.5 items-center hover:bg-muted/[0.03] transition-colors ${
                  m.status === "inactive" ? "opacity-50" : ""
                }`}
              >
                {/* Name / email */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={m.name} email={m.email} />
                  <div className="min-w-0">
                    {m.name ? (
                      <>
                        <p className="text-sm font-semibold truncate leading-tight">{m.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{m.email}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-muted-foreground truncate leading-tight">{m.email}</p>
                        <p className="text-[11px] text-amber-500 mt-0.5">가입 전</p>
                      </>
                    )}
                  </div>
                </div>

                <div><RoleBadge role={m.role} /></div>
                <div><StatusDot status={m.status} /></div>
                <div className="text-xs text-muted-foreground">
                  {m.last_login_at ?? <span className="text-amber-500 font-medium">미접속</span>}
                </div>
                <div>
                  <ActionButton member={m} onStatusChange={handleStatus} onResend={handleResend} />
                </div>
              </div>
            ))}
          </div>
        )}
      </PanelCard>

      {toast && <Toast message={toast} />}
    </div>
  );
}
