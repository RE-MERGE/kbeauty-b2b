import {useEffect, useState} from "react";
import {Ban, CheckCircle, Clock, Search, ShieldCheck, UserPlus, Users, X,} from "lucide-react";
import {getCompanyMembers, inviteMember, updateMemberRole, updateMemberStatus,} from "@/api/company/company.service";
import type {BusinessRole, CompanyMemberResponse, MemberRole} from "@/api/company/company.types";
import {Avatar, inputCls, PanelCard, RoleBadge, StatusDot, Toast,} from "./shared";

// ── InvitePanel ───────────────────────────────────────────────────────────────
function InvitePanel({ onClose, onInvite }: {
  onClose: () => void;
  onInvite: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const invalid = !email.trim() || !email.includes("@") || loading;

  const submit = async () => {
    if (!invalid) {
      setLoading(true);
      await onInvite(email.trim());
      setLoading(false);
      setEmail("");
    }
  };

  return (
      <div className="border border-primary/25 bg-primary/[0.03] rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus size={14} className="text-primary"/>
            <span className="text-sm font-semibold">직원 초대</span>
          </div>
          <button onClick={onClose}
                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X size={14}/>
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
              disabled={loading}
          />
          <button
              onClick={submit}
              disabled={invalid}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            {loading ? "보내는 중..." : "초대 보내기"}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <ShieldCheck size={11} className="text-primary/50 shrink-0"/>
          가입 완료 후 이 목록에 자동으로 추가됩니다.
        </p>
      </div>
  );
}

// ── ActionButton ──────────────────────────────────────────────────────────────
function ActionButton({member, onStatusChange}: {
  member: CompanyMemberResponse;
  onStatusChange: (id: number, s: "APPROVED" | "SUSPENDED") => void;
}) {
  if (member.role === "PRESIDENT")
    return <span className="text-xs text-muted-foreground/30">–</span>;

  if (member.status === "PENDING")
    return (
        <span className="text-xs text-amber-500 font-medium">초대 대기중</span>
    );

  if (member.status === "APPROVED")
    return (
        <button onClick={() => onStatusChange(member.userId, "SUSPENDED")}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors w-full justify-center">
          <Ban size={10}/> 비활성화
        </button>
    );

  return (
      <button onClick={() => onStatusChange(member.userId, "APPROVED")}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-emerald-200 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors w-full justify-center">
        <CheckCircle size={10}/> 활성화
      </button>
  );
}

// ── MembersTab ────────────────────────────────────────────────────────────────
type FilterTab = "all" | "APPROVED" | "PENDING" | "SUSPENDED";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  {key: "all", label: "전체"},
  {key: "APPROVED", label: "활성"},
  {key: "PENDING", label: "초대 대기"},
  {key: "SUSPENDED", label: "비활성"},
];

export function MembersTab() {
  const [members, setMembers] = useState<CompanyMemberResponse[]>([]);
  const [filterTab, setFilterTab]   = useState<FilterTab>("all");
  const [search, setSearch]         = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  // 데이터 로드
  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await getCompanyMembers();
      setMembers(data);
    } catch (err) {
      showToast("직원 목록을 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  // 직원 초대 API 연동
  const handleInvite = async (email: string) => {
    try {
      await inviteMember({email});
      showToast(`${email}로 초대 메일을 발송했습니다.`);
      setShowInvite(false);
      loadMembers(); // 초대 후 목록 리프레시
    } catch (err) {
      showToast("초대 메일 발송에 실패했습니다.");
    }
  };

  // 계정 상태 변경 API 연동
  const handleStatus = async (userId: number, status: "APPROVED" | "SUSPENDED") => {
    try {
      await updateMemberStatus(userId, {status});
      setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? {...m, status} : m))
      );
      showToast(status === "APPROVED" ? "계정을 활성화했습니다." : "계정을 비활성화했습니다.");
    } catch (err) {
      showToast("상태 변경에 실패했습니다.");
    }
  };

  // 역할(UserRole, BusinessRole) 변경 API 연동
  const handleRoleChange = async (userId: number, fields: { role?: MemberRole; businessRole?: BusinessRole }) => {
    try {
      await updateMemberRole(userId, fields);
      setMembers((prev) =>
          prev.map((m) => (m.userId === userId ? {...m, ...fields} : m))
      );
      showToast("권한을 성공적으로 수정했습니다.");
    } catch (err) {
      showToast("권한 수정에 실패했습니다.");
    }
  };

  const stats = {
    total: members.length,
    APPROVED: members.filter((m) => m.status === "APPROVED").length,
    PENDING: members.filter((m) => m.status === "PENDING").length,
    SUSPENDED: members.filter((m) => m.status === "SUSPENDED").length,
  };

  const filtered = members.filter((m) => {
    const matchTab    = filterTab === "all" || m.status === filterTab;
    const q           = search.trim().toLowerCase();
    const matchSearch = !q || (m.name && m.name.toLowerCase().includes(q)) || m.email.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  if (loading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">데이터를 불러오는 중입니다...</div>;
  }

  return (
      <div className="space-y-4">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">직원을 초대하고 계정 상태 및 권한을 관리하세요.</p>
          <button
              onClick={() => setShowInvite((v) => !v)}
              className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <UserPlus size={13}/> 직원 초대
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-3">
          {[
            {label: "전체 인원", value: stats.total, cls: "text-foreground"},
            {label: "활성", value: stats.APPROVED, cls: "text-emerald-600"},
            {label: "초대 대기", value: stats.PENDING, cls: "text-amber-500"},
            {label: "비활성", value: stats.SUSPENDED, cls: "text-slate-400"},
          ].map((s) => (
              <div key={s.label} className="bg-white border border-border rounded-xl px-4 py-3.5">
                <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
          ))}
        </div>

        {/* Invite panel */}
        {showInvite && (
            <InvitePanel onClose={() => setShowInvite(false)} onInvite={handleInvite}/>
        )}

        {/* Pending notice */}
        {stats.PENDING > 0 && !showInvite && (
            <div
                className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
              <Clock size={13} className="shrink-0 text-amber-500"/>
              초대 수락을 기다리는 직원이 <strong>{stats.PENDING}명</strong> 있습니다.
            </div>
        )}

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-60">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
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
        <PanelCard title={`직원 ${filtered.length}명`} icon={<Users size={13}/>} noPad>
          {/* thead 컬럼 비율 조정: 이름(2fr) / 내부역할(1.2fr) / 거래역할(1.2fr) / 상태(1fr) / 관리(1fr) */}
          <div
              className="grid grid-cols-[3fr_3fr_3fr_2fr_1fr] gap-4 px-5 py-2.5 bg-muted/30 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            <span>이름 / 이메일</span>
            <span>서비스 권한</span>
            <span>거래 유형</span>
            <span>상태</span>
            <span className="text-center">계정 제어</span>
          </div>

          {filtered.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">
                해당하는 직원이 없습니다.
              </div>
          ) : (
              <div className="divide-y divide-border">
                {filtered.map((m) => (
                    <div
                        key={m.userId}
                        className={`grid grid-cols-[2fr_1.2fr_1.2fr_1fr_1fr] gap-4 px-5 py-3.5 items-center hover:bg-muted/[0.03] transition-colors ${
                            m.status === "SUSPENDED" ? "opacity-50" : ""
                        }`}
                    >
                      {/* Name / email */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={m.name || ""} email={m.email}/>
                        <div className="min-w-0">
                          {m.name ? (
                              <>
                                <p className="text-sm font-semibold truncate leading-tight">{m.name}</p>
                                <p className="text-[11px] text-muted-foreground truncate mt-0.5">{m.email}</p>
                              </>
                          ) : (
                              <>
                                <p className="text-sm text-muted-foreground truncate leading-tight">{m.email}</p>
                                <p className="text-[11px] text-amber-500 mt-0.5">가입 대기 (초대됨)</p>
                              </>
                          )}
                        </div>
                      </div>

                      {/* User Role Select */}
                      <div>
                        {m.role === "PRESIDENT" ? (
                            <RoleBadge role="president"/>
                        ) : (
                            <select
                                value={m.role}
                                onChange={(e) => handleRoleChange(m.userId, {role: e.target.value as MemberRole})}
                                className="text-xs bg-white border border-border rounded px-2 py-1 outline-none focus:border-primary"
                            >
                              <option value="EMPLOYEE">EMPLOYEE (직원)</option>
                              <option value="ADMIN">ADMIN (관리자)</option>
                            </select>
                        )}
                      </div>

                      {/* Business Role Select */}
                      <div>
                        <select
                            value={m.businessRole}
                            onChange={(e) => handleRoleChange(m.userId, {businessRole: e.target.value as BusinessRole})}
                            className="text-xs bg-white border border-border rounded px-2 py-1 outline-none focus:border-primary"
                        >
                          <option value="BUYER">BUYER (구매자)</option>
                          <option value="SELLER">SELLER (판매자)</option>
                          <option value="BOTH">BOTH (동시 이용)</option>
                        </select>
                      </div>

                      {/* Status */}
                      <div>
                        <StatusDot
                            status={m.status === "APPROVED" ? "active" : m.status === "PENDING" ? "pending" : "inactive"}/>
                      </div>

                      {/* Account Management Action */}
                      <div className="text-center">
                        <ActionButton member={m} onStatusChange={handleStatus}/>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </PanelCard>

        {toast && <Toast message={toast}/>}
      </div>
  );
}