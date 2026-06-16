import React, { useState, useRef, type JSX } from "react";
import {
  UserPlus, Mail, Clock, CheckCircle, XCircle, AlertCircle,
  X, Search, Crown, Ban, Building2, Globe, Camera, Lock,
  Upload, ShieldCheck, Users, Save, MapPin, Plus,
  Pencil, Trash2, Star, Package, RotateCcw, ChevronRight,
  Shield, ShieldAlert, ShieldX, ShieldOff, Settings,
  Bell, Layers,
} from "lucide-react";

// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

type Role         = "president" | "employee";
type MemberStatus = "active" | "pending" | "inactive";
type SellerStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
type ActiveTab    = "members" | "addresses" | "company";
type FilterTab    = "all" | "active" | "pending" | "inactive";
type DefaultType  = "return" | "shipping" | "receiving";

interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  last_login_at: string | null;
  joinedAt: string;
}

interface Address {
  addressId: number;
  companyId: number;
  addressName: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  createdAt: string;
  deletedAt: string | null;
}

interface CompanyDefaults { returnAddressId: number | null }
interface UserDefaults { shippingAddressId: number | null; receivingAddressId: number | null }

interface CompanyForm {
  name: string;
  logoFile: File | null;
  logo_url: string | null;
  business_license_url: string | null;
  businessLicenseFile: File | null;
  representative_name: string;
  address: string;
  address_detail: string;
  website_url: string;
  description: string;
}

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════

const ROLE_META: Record<Role, { label: string; color: string }> = {
  president: { label: "대표",  color: "bg-amber-50 text-amber-700 border-amber-200" },
  employee:  { label: "직원",  color: "bg-blue-50 text-blue-700 border-blue-200"   },
};

const MEMBER_STATUS_META: Record<MemberStatus, {
  label: string; icon: JSX.Element; color: string; dot: string;
}> = {
  active:   { label: "활성",     icon: <CheckCircle size={12} />, color: "text-emerald-600", dot: "bg-emerald-400" },
  pending:  { label: "초대 대기", icon: <Clock size={12} />,       color: "text-amber-500",  dot: "bg-amber-400"  },
  inactive: { label: "비활성",   icon: <XCircle size={12} />,     color: "text-slate-400",  dot: "bg-slate-300"  },
};

const SELLER_STATUS_META: Record<SellerStatus, {
  label: string; desc: string; color: string; bg: string; border: string;
  icon: JSX.Element; pill: string;
}> = {
  NONE: {
    label: "미신청", desc: "셀러 승인을 신청하면 플랫폼에서 상품을 판매할 수 있습니다.",
    color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200",
    icon: <ShieldOff size={15} />, pill: "bg-slate-100 text-slate-600 border-slate-200",
  },
  PENDING: {
    label: "심사 중", desc: "제출된 서류를 검토 중입니다. 보통 1~2 영업일 내 완료됩니다.",
    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    icon: <Shield size={15} />, pill: "bg-amber-100 text-amber-700 border-amber-200",
  },
  APPROVED: {
    label: "승인됨", desc: "셀러 인증이 완료되었습니다. 정보 변경 시 재심사가 진행될 수 있습니다.",
    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
    icon: <ShieldCheck size={15} />, pill: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "반려됨", desc: "서류 반려 사유를 확인하고 사업자등록증을 재업로드해 주세요.",
    color: "text-red-700", bg: "bg-red-50", border: "border-red-200",
    icon: <ShieldAlert size={15} />, pill: "bg-red-100 text-red-700 border-red-200",
  },
};

const DEFAULT_META: Record<DefaultType, {
  label: string; icon: JSX.Element; color: string; bg: string; border: string; desc: string;
}> = {
  return:    { label: "기본 반품지",   desc: "회사 공통 반품지",  icon: <RotateCcw size={11} />, color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200"  },
  shipping:  { label: "내 기본 출고지", desc: "내 출고 기본값",    icon: <Package size={11} />,   color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200" },
  receiving: { label: "내 기본 수령지", desc: "내 수령 기본값",    icon: <Star size={11} />,      color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200"   },
};

const SIDEBAR_NAV: { key: ActiveTab; label: string; icon: JSX.Element; desc: string }[] = [
  { key: "members",   label: "직원 관리", icon: <Users size={15} />,    desc: "팀원 초대 및 권한 관리" },
  { key: "addresses", label: "주소 관리", icon: <MapPin size={15} />,   desc: "출고지 · 반품지 설정"  },
  { key: "company",   label: "회사 정보", icon: <Building2 size={15} />, desc: "사업자 정보 및 소개"   },
];

// ════════════════════════════════════════════════════════════════════════════
// MOCK DATA
// ════════════════════════════════════════════════════════════════════════════

const MOCK_MEMBERS: Member[] = [
  { id: "1", name: "홍길동", email: "hong@fashionco.kr", role: "president", status: "active",   last_login_at: "방금 전",    joinedAt: "2024.01.15" },
  { id: "2", name: "이영희", email: "lee@fashionco.kr",  role: "employee",  status: "active",   last_login_at: "2시간 전",   joinedAt: "2024.03.02" },
  { id: "3", name: "김철수", email: "kim@fashionco.kr",  role: "employee",  status: "active",   last_login_at: "어제",       joinedAt: "2024.05.11" },
  { id: "4", name: "박지원", email: "park@fashionco.kr", role: "employee",  status: "active",   last_login_at: "3일 전",     joinedAt: "2024.06.20" },
  { id: "5", name: "최민준", email: "choi@fashionco.kr", role: "employee",  status: "inactive", last_login_at: "2024.11.01", joinedAt: "2024.04.08" },
  { id: "6", name: "",       email: "new1@partner.kr",   role: "employee",  status: "pending",  last_login_at: null,         joinedAt: "2025.01.10" },
  { id: "7", name: "",       email: "new2@partner.kr",   role: "employee",  status: "pending",  last_login_at: null,         joinedAt: "2025.01.12" },
];

const MOCK_COMPANY: CompanyForm = {
  name: "(주)패션코리아",
  logoFile: null, logo_url: null,
  business_license_url: "사업자등록증_패션코리아.pdf",
  businessLicenseFile: null,
  representative_name: "홍길동",
  address: "서울특별시 중구 을지로 123",
  address_detail: "패션빌딩 5층",
  website_url: "https://fashionkorea.kr",
  description: "동대문 기반 의류 도매 전문 업체입니다. 티셔츠, 니트, 아우터 등 다양한 카테고리를 취급하며 소량 MOQ 가능합니다.",
};

const MOCK_ADDRESSES: Address[] = [
  { addressId: 1, companyId: 1, addressName: "본사",       zipcode: "04538", address: "서울특별시 중구 을지로 123",         addressDetail: "패션빌딩 5층", createdAt: "2024.01.15", deletedAt: null },
  { addressId: 2, companyId: 1, addressName: "김포 물류창고", zipcode: "10003", address: "경기도 김포시 양촌읍 물류로 456",     addressDetail: "A동 3층",     createdAt: "2024.03.02", deletedAt: null },
  { addressId: 3, companyId: 1, addressName: "부산 센터",   zipcode: "48058", address: "부산광역시 해운대구 센터로 789",      addressDetail: "2층",         createdAt: "2024.06.10", deletedAt: null },
];

const MOCK_COMP_DEF: CompanyDefaults = { returnAddressId: 2 };
const MOCK_USER_DEF: UserDefaults    = { shippingAddressId: 2, receivingAddressId: 1 };

// ════════════════════════════════════════════════════════════════════════════
// SHARED PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

const inputCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white placeholder:text-muted-foreground/40";
const readonlyCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted/40 text-muted-foreground cursor-not-allowed";

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-primary ml-1 text-[11px] font-normal opacity-70">(필수)</span>}
        </label>
        {children}
        {hint && <p className="text-[11px] text-muted-foreground leading-relaxed">{hint}</p>}
      </div>
  );
}

/** White card with a titled top bar — mirrors panel style from dashboards */
function PanelCard({ title, icon, badge, children, noPad }: {
  title: string; icon?: React.ReactNode; badge?: React.ReactNode;
  children: React.ReactNode; noPad?: boolean;
}) {
  return (
      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between gap-2 px-5 py-3 border-b border-border bg-muted/[0.03]">
          <div className="flex items-center gap-2">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="text-sm font-semibold text-foreground">{title}</span>
          </div>
          {badge}
        </div>
        <div className={noPad ? "" : "p-5 space-y-4"}>{children}</div>
      </div>
  );
}

function RoleBadge({ role }: { role: Role }) {
  const m = ROLE_META[role];
  return (
      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${m.color}`}>
      {role === "president" && <Crown size={9} />}{m.label}
    </span>
  );
}

function StatusDot({ status }: { status: MemberStatus }) {
  const m = MEMBER_STATUS_META[status];
  return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${m.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.dot}`} />{m.label}
    </span>
  );
}

function Avatar({ name, email }: { name: string; email: string }) {
  const initials = name ? name.slice(0, 2) : email.slice(0, 2).toUpperCase();
  return (
      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
        {initials}
      </div>
  );
}

function DefaultBadge({ type }: { type: DefaultType }) {
  const m = DEFAULT_META[type];
  return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${m.color} ${m.bg} ${m.border}`}>
      {m.icon}{m.label}
    </span>
  );
}

function Toast({ message }: { message: string }) {
  return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm font-medium px-5 py-3 rounded-full shadow-xl flex items-center gap-2">
        <CheckCircle size={14} className="text-emerald-400" />{message}
      </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 1  직원 관리
// ════════════════════════════════════════════════════════════════════════════

function InvitePanel({ onClose, onInvite }: { onClose: () => void; onInvite: (e: string) => void }) {
  const [email, setEmail] = useState("");
  const invalid = !email.trim() || !email.includes("@");
  const submit  = () => { if (!invalid) { onInvite(email.trim()); setEmail(""); } };
  return (
      <div className="border border-primary/25 bg-primary/[0.03] rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus size={14} className="text-primary" />
            <span className="text-sm font-semibold">팀원 초대</span>
          </div>
          <button onClick={onClose} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X size={14} /></button>
        </div>
        <div className="flex gap-2">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                 onKeyDown={(e) => e.key === "Enter" && submit()}
                 placeholder="초대할 이메일 주소"
                 className={inputCls} />
          <button onClick={submit} disabled={invalid}
                  className="px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap">
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

function MembersTab() {
  const [members, setMembers]         = useState<Member[]>(MOCK_MEMBERS);
  const [filterTab, setFilterTab]     = useState<FilterTab>("all");
  const [search, setSearch]           = useState("");
  const [showInvite, setShowInvite]   = useState(false);
  const [toast, setToast]             = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleInvite = (email: string) => {
    setMembers((p) => [...p, { id: String(Date.now()), name: "", email, role: "employee", status: "pending", last_login_at: null, joinedAt: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(/\.$/, "") }]);
    setShowInvite(false);
    showToast(`${email}로 초대 메일을 발송했습니다.`);
  };

  const handleStatus = (id: string, status: MemberStatus) => {
    setMembers((p) => p.map((m) => m.id === id ? { ...m, status } : m));
    showToast(status === "active" ? "계정을 활성화했습니다." : "계정을 비활성화했습니다.");
  };

  const handleResend = (id: string) => {
    const m = members.find((m) => m.id === id);
    if (m) showToast(`${m.email}로 초대 메일을 재발송했습니다.`);
  };

  const stats = {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    inactive: members.filter((m) => m.status === "inactive").length,
  };

  const filtered = members.filter((m) => {
    const matchTab = filterTab === "all" || m.status === filterTab;
    const q = search.trim().toLowerCase();
    return matchTab && (!q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q));
  });

  const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: "all",      label: "전체" },
    { key: "active",   label: "활성" },
    { key: "pending",  label: "초대 대기" },
    { key: "inactive", label: "비활성" },
  ];

  return (
      <div className="space-y-4">
        {/* Topbar */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">직원을 초대하고 계정 상태를 관리하세요.</p>
          <button onClick={() => setShowInvite((v) => !v)}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors">
            <UserPlus size={13} /> 팀원 초대
          </button>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "전체",      value: stats.total,    cls: "text-foreground" },
            { label: "활성",      value: stats.active,   cls: "text-emerald-600" },
            { label: "초대 대기", value: stats.pending,  cls: "text-amber-500" },
            { label: "비활성",    value: stats.inactive, cls: "text-slate-400" },
          ].map((s) => (
              <div key={s.label} className="bg-white border border-border rounded-xl px-4 py-3.5">
                <p className={`text-2xl font-black ${s.cls}`}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
          ))}
        </div>

        {showInvite && <InvitePanel onClose={() => setShowInvite(false)} onInvite={handleInvite} />}

        {stats.pending > 0 && !showInvite && (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
              <Clock size={13} className="shrink-0 text-amber-500" />
              초대 수락을 기다리는 팀원이 <strong>{stats.pending}명</strong> 있습니다.
            </div>
        )}

        {/* Search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-60">
            <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                   placeholder="이름 또는 이메일"
                   className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
          </div>
          <div className="flex border border-border rounded-lg overflow-hidden text-xs ml-auto">
            {FILTER_TABS.map((t) => (
                <button key={t.key} onClick={() => setFilterTab(t.key)}
                        className={`px-3.5 py-2 font-semibold transition-colors whitespace-nowrap ${filterTab === t.key ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-foreground hover:bg-muted/20"}`}>
                  {t.label}
                  {t.key !== "all" && <span className={`ml-1 ${filterTab === t.key ? "opacity-70" : ""}`}>({stats[t.key as keyof typeof stats]})</span>}
                </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <PanelCard title={`팀원 ${filtered.length}명`} icon={<Users size={13} />} noPad>
          {/* thead */}
          <div className="grid grid-cols-[minmax(0,2.5fr)_90px_110px_140px_90px] gap-4 px-5 py-2.5 bg-muted/30 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            <span>이름 / 이메일</span><span>역할</span><span>상태</span><span>최근 로그인</span><span>관리</span>
          </div>
          {filtered.length === 0 ? (
              <div className="py-14 text-center text-sm text-muted-foreground">해당하는 팀원이 없습니다.</div>
          ) : (
              <div className="divide-y divide-border">
                {filtered.map((m) => (
                    <div key={m.id}
                         className={`grid grid-cols-[minmax(0,2.5fr)_90px_110px_140px_90px] gap-4 px-5 py-3.5 items-center hover:bg-muted/[0.03] transition-colors ${m.status === "inactive" ? "opacity-50" : ""}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar name={m.name} email={m.email} />
                        <div className="min-w-0">
                          {m.name
                              ? <><p className="text-sm font-semibold truncate leading-tight">{m.name}</p><p className="text-[11px] text-muted-foreground truncate mt-0.5">{m.email}</p></>
                              : <><p className="text-sm text-muted-foreground truncate leading-tight">{m.email}</p><p className="text-[11px] text-amber-500 mt-0.5">가입 전</p></>}
                        </div>
                      </div>
                      <div><RoleBadge role={m.role} /></div>
                      <div><StatusDot status={m.status} /></div>
                      <div className="text-xs text-muted-foreground">{m.last_login_at ?? <span className="text-amber-500 font-medium">미접속</span>}</div>
                      <div>
                        {m.role === "president"
                            ? <span className="text-xs text-muted-foreground/30">–</span>
                            : m.status === "pending"
                                ? <button onClick={() => handleResend(m.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-primary/20 text-[11px] font-medium text-primary hover:bg-primary/5 transition-colors"><Mail size={10} />재발송</button>
                                : m.status === "active"
                                    ? <button onClick={() => handleStatus(m.id, "inactive")} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-red-200 text-[11px] font-medium text-red-600 hover:bg-red-50 transition-colors"><Ban size={10} />비활성화</button>
                                    : <button onClick={() => handleStatus(m.id, "active")} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-emerald-200 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"><CheckCircle size={10} />활성화</button>
                        }
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

// ════════════════════════════════════════════════════════════════════════════
// TAB 2  주소 관리
// ════════════════════════════════════════════════════════════════════════════

interface AddressFormData { addressName: string; zipcode: string; address: string; addressDetail: string }
const EMPTY_ADDR: AddressFormData = { addressName: "", zipcode: "", address: "", addressDetail: "" };

function AddressFormPanel({ initial, onSave, onCancel }: {
  initial?: AddressFormData; onSave: (d: AddressFormData) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState<AddressFormData>(initial ?? EMPTY_ADDR);
  const [srch, setSrch] = useState(false);
  const set = (p: Partial<AddressFormData>) => setForm((f) => ({ ...f, ...p }));
  const isValid = form.addressName.trim() && form.address.trim();

  return (
      <div className="border border-primary/25 bg-primary/[0.03] rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2"><MapPin size={14} className="text-primary" /><span className="text-sm font-semibold">{initial ? "주소 수정" : "새 주소 추가"}</span></div>
          <button onClick={onCancel} className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><X size={14} /></button>
        </div>
        <div className="space-y-3">
          <Field label="주소 이름" required hint="팀원들이 알아보기 쉬운 이름 (예: 본사, 김포창고)">
            <input type="text" value={form.addressName} onChange={(e) => set({ addressName: e.target.value })} placeholder="본사 / 김포창고 / 부산센터" className={inputCls} />
          </Field>
          <Field label="우편번호">
            <div className="flex gap-2">
              <input type="text" value={form.zipcode} onChange={(e) => set({ zipcode: e.target.value })} placeholder="12345" maxLength={6} className={`${inputCls} max-w-[130px]`} />
              <button type="button" onClick={() => { setSrch(true); setTimeout(() => { set({ address: "서울특별시 중구 을지로 123" }); setSrch(false); }, 600); }}
                      disabled={srch || !form.zipcode.trim()}
                      className="flex items-center gap-1.5 px-3 py-2.5 border border-border rounded-lg text-sm text-foreground hover:border-primary hover:text-primary disabled:opacity-40 transition-colors bg-white whitespace-nowrap">
                <Search size={12} />{srch ? "검색 중…" : "주소 검색"}
              </button>
            </div>
          </Field>
          <Field label="기본 주소" required>
            <div className="space-y-2">
              <input type="text" value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="도로명 주소" className={inputCls} />
              <input type="text" value={form.addressDetail} onChange={(e) => set({ addressDetail: e.target.value })} placeholder="상세 주소 (동/호수 등)" className={inputCls} />
            </div>
          </Field>
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white">취소</button>
          <button onClick={() => isValid && onSave(form)} disabled={!isValid}
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white rounded-lg text-sm font-semibold transition-colors">
            {initial ? "수정 완료" : "주소 추가"}
          </button>
        </div>
      </div>
  );
}

function AddressCard({ addr, compDef, userDef, onEdit, onDelete, onSetDefault }: {
  addr: Address; compDef: CompanyDefaults; userDef: UserDefaults;
  onEdit: (a: Address) => void; onDelete: (id: number) => void; onSetDefault: (id: number, t: DefaultType) => void;
}) {
  const isReturn   = compDef.returnAddressId   === addr.addressId;
  const isShipping = userDef.shippingAddressId === addr.addressId;
  const isReceiving = userDef.receivingAddressId === addr.addressId;
  const badges: DefaultType[] = [...(isReturn ? ["return" as DefaultType] : []), ...(isShipping ? ["shipping" as DefaultType] : []), ...(isReceiving ? ["receiving" as DefaultType] : [])];

  return (
      <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 size={13} className="text-primary" />
            </div>
            <span className="font-semibold text-sm truncate">{addr.addressName}</span>
          </div>
          <div className="flex gap-0.5 shrink-0">
            <button onClick={() => onEdit(addr)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"><Pencil size={12} /></button>
            <button onClick={() => onDelete(addr.addressId)} className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-mono text-muted-foreground/50 mr-1">[{addr.zipcode}]</span>{addr.address}
          {addr.addressDetail && <span className="block mt-0.5 text-muted-foreground/70">{addr.addressDetail}</span>}
        </div>
        {badges.length > 0 && <div className="flex flex-wrap gap-1.5">{badges.map((t) => <DefaultBadge key={t} type={t} />)}</div>}
        <div className="border-t border-border/60 pt-2.5 flex flex-wrap gap-1.5">
          {([
            { type: "return" as DefaultType,    active: isReturn,    label: "반품지로 설정" },
            { type: "shipping" as DefaultType,  active: isShipping,  label: "내 출고지로 설정" },
            { type: "receiving" as DefaultType, active: isReceiving, label: "내 수령지로 설정" },
          ]).map(({ type, active, label }) => (
              <button key={type} onClick={() => !active && onSetDefault(addr.addressId, type)} disabled={active}
                      className={`text-[11px] font-medium px-2.5 py-1 rounded-md border transition-colors ${active ? `${DEFAULT_META[type].color} ${DEFAULT_META[type].bg} ${DEFAULT_META[type].border} cursor-default` : "text-muted-foreground border-border hover:border-primary/40 hover:text-primary bg-white"}`}>
                {active ? "✓ " : ""}{label}
              </button>
          ))}
        </div>
      </div>
  );
}

function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>(MOCK_ADDRESSES);
  const [compDef, setCompDef]     = useState<CompanyDefaults>(MOCK_COMP_DEF);
  const [userDef, setUserDef]     = useState<UserDefaults>(MOCK_USER_DEF);
  const [formMode, setFormMode]   = useState<null | "new" | Address>(null);
  const [toast, setToast]         = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleSave = (data: AddressFormData) => {
    if (formMode === "new") {
      setAddresses((p) => [...p, { addressId: Date.now(), companyId: 1, ...data, createdAt: new Date().toLocaleDateString("ko-KR"), deletedAt: null }]);
      showToast("주소를 추가했습니다.");
    } else if (formMode /*&& formMode !== "new"*/) {
      setAddresses((p) => p.map((a) => a.addressId === (formMode as Address).addressId ? { ...a, ...data } : a));
      showToast("주소를 수정했습니다.");
    }
    setFormMode(null);
  };

  const handleDelete = (id: number) => {
    setAddresses((p) => p.filter((a) => a.addressId !== id));
    setCompDef((p) => ({ returnAddressId: p.returnAddressId === id ? null : p.returnAddressId }));
    setUserDef((p) => ({ shippingAddressId: p.shippingAddressId === id ? null : p.shippingAddressId, receivingAddressId: p.receivingAddressId === id ? null : p.receivingAddressId }));
    showToast("주소를 삭제했습니다.");
  };

  const handleSetDefault = (id: number, type: DefaultType) => {
    if (type === "return")   setCompDef({ returnAddressId: id });
    else if (type === "shipping")  setUserDef((p) => ({ ...p, shippingAddressId: id }));
    else                           setUserDef((p) => ({ ...p, receivingAddressId: id }));
    showToast(`기본 ${DEFAULT_META[type].label}을 변경했습니다.`);
  };

  const find = (id: number | null) => id != null ? addresses.find((a) => a.addressId === id) : null;

  const editInitial = formMode && formMode !== "new"
      ? { addressName: (formMode as Address).addressName, zipcode: (formMode as Address).zipcode, address: (formMode as Address).address, addressDetail: (formMode as Address).addressDetail }
      : undefined;

  return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">회사 공용 주소록을 관리하고 기본 주소를 설정하세요.</p>
          <button onClick={() => setFormMode("new")} disabled={formMode !== null}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors">
            <Plus size={13} /> 주소 추가
          </button>
        </div>

        {/* Defaults summary */}
        <PanelCard title="현재 기본 주소 설정" icon={<MapPin size={13} />}>
          <div className="space-y-2.5">
            {(["return", "shipping", "receiving"] as DefaultType[]).map((type) => {
              const addr = type === "return" ? find(compDef.returnAddressId) : type === "shipping" ? find(userDef.shippingAddressId) : find(userDef.receivingAddressId);
              const m = DEFAULT_META[type];
              return (
                  <div key={type} className="flex items-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1 font-semibold w-[104px] shrink-0 ${m.color}`}>{m.icon}{m.label}</span>
                    <span className="text-muted-foreground/40">·</span>
                    {addr
                        ? <span className="text-foreground font-medium">{addr.addressName} <span className="text-muted-foreground font-normal ml-1">{addr.address}</span></span>
                        : <span className="text-muted-foreground italic">설정된 주소 없음</span>}
                  </div>
              );
            })}
          </div>
        </PanelCard>

        {formMode !== null && <AddressFormPanel initial={editInitial} onSave={handleSave} onCancel={() => setFormMode(null)} />}

        {addresses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
              <MapPin size={28} className="text-muted-foreground/20 mb-3" />
              <p className="text-sm font-medium text-muted-foreground">등록된 주소가 없습니다.</p>
              <p className="text-xs text-muted-foreground mt-1">주소 추가 버튼을 눌러 등록하세요.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {addresses.map((addr) => (
                  <AddressCard key={addr.addressId} addr={addr} compDef={compDef} userDef={userDef}
                               onEdit={(a) => setFormMode(a)} onDelete={handleDelete} onSetDefault={handleSetDefault} />
              ))}
            </div>
        )}

        <div className="flex flex-wrap gap-4 pt-1">
          {(Object.entries(DEFAULT_META) as [DefaultType, (typeof DEFAULT_META)[DefaultType]][]).map(([type, m]) => (
              <div key={type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <DefaultBadge type={type} /><span>— {m.desc}</span>
              </div>
          ))}
        </div>

        {toast && <Toast message={toast} />}
      </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB 3  회사 정보
// ════════════════════════════════════════════════════════════════════════════

function SellerStatusCard({ status }: { status: SellerStatus }) {
  const m = SELLER_STATUS_META[status];
  return (
      <div className={`rounded-xl border p-4 mb-2 ${m.bg} ${m.border}`}>
        <div className="flex items-start gap-3">
          <span className={`${m.color} mt-0.5 shrink-0`}>{m.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-bold ${m.color}`}>셀러 승인 상태</p>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${m.pill}`}>{m.label}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{m.desc}</p>
            {status === "PENDING" && (
                <div className="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground">
                  <CheckCircle size={11} className="text-emerald-500" /><span>서류 제출 완료</span>
                  <span className="w-5 h-px bg-border" />
                  <Clock size={11} className="text-amber-500" /><span className="text-amber-600 font-medium">심사 중 (1–2 영업일)</span>
                  <span className="w-5 h-px bg-border" />
                  <span className="text-muted-foreground/50">승인 완료</span>
                </div>
            )}
            {status === "REJECTED" && (
                <div className="flex gap-2 mt-2.5">
                  <button className="text-xs font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors">반려 사유 확인</button>
                  <span className="text-muted-foreground/40">·</span>
                  <button className="text-xs font-semibold text-red-700 underline underline-offset-2 hover:text-red-900 transition-colors">사업자등록증 재업로드</button>
                </div>
            )}
            {status === "NONE" && (
                <button className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors">
                  <ShieldCheck size={11} /> 셀러 승인 신청
                </button>
            )}
          </div>
        </div>
      </div>
  );
}

function CompanyTab() {
  const [form, setForm]           = useState<CompanyForm>(MOCK_COMPANY);
  const [sellerStatus]            = useState<SellerStatus>("APPROVED");
  const [logoPreview, setLogoP]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState<string | null>(null);
  const logoRef                   = useRef<HTMLInputElement>(null);
  const licenseRef                = useRef<HTMLInputElement>(null);
  const set = (p: Partial<CompanyForm>) => setForm((f) => ({ ...f, ...p }));

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    set({ logoFile: file });
    const r = new FileReader(); r.onload = (ev) => setLogoP(ev.target?.result as string); r.readAsDataURL(file);
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setToast("회사 정보가 저장되었습니다."); setTimeout(() => setToast(null), 3000); }, 900);
  };

  const logoSrc = logoPreview;
  const initials = form.name.replace(/[\(\)주식회사㈜]/g, "").trim().slice(0, 2) || "FC";

  return (
      <div className="space-y-4">
        <SellerStatusCard status={sellerStatus} />

        {/* 브랜드 & 소개 */}
        <PanelCard title="브랜드 & 소개" icon={<Users size={13} />}>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div onClick={() => logoRef.current?.click()}
                   className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors group">
                {logoSrc ? <img src={logoSrc} alt="로고" className="w-full h-full object-cover" />
                    : <span className="text-xl font-black text-primary/30">{initials}</span>}
                <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={17} className="text-white" />
                </div>
              </div>
              <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
            </div>
            <div>
              <p className="text-sm font-medium mb-0.5">회사 로고</p>
              <p className="text-xs text-muted-foreground">JPG, PNG · 최대 2MB · 정사각형 권장</p>
              <button type="button" onClick={() => logoRef.current?.click()} className="mt-2 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                {logoSrc ? "로고 변경" : "로고 업로드"}
              </button>
            </div>
          </div>
          <Field label="상호명" required>
            <input type="text" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="(주)패션코리아" className={inputCls} />
          </Field>
          <Field label="회사 소개" hint={`${form.description.length} / 500자`}>
          <textarea value={form.description}
                    onChange={(e) => e.target.value.length <= 500 && set({ description: e.target.value })}
                    placeholder="취급 카테고리, 최소 주문 수량, 납기 기준 등을 자유롭게 입력해 주세요."
                    rows={4} className={`${inputCls} resize-none`} />
          </Field>
        </PanelCard>

        {/* 사업자 정보 */}
        <PanelCard title="사업자 정보" icon={<Building2 size={13} />}>
          <Field label="사업자등록번호" hint="변경이 필요하면 고객센터에 문의해 주세요.">
            <div className="relative">
              <input type="text" value="123-45-67890" readOnly className={`${readonlyCls} pr-9`} />
              <Lock size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40" />
            </div>
          </Field>
          <Field label="대표자명" required>
            <input type="text" value={form.representative_name} onChange={(e) => set({ representative_name: e.target.value })} placeholder="홍길동" className={inputCls} />
          </Field>
          <Field label="사업자등록증" hint="갱신이 있을 경우 새 파일을 업로드하세요.">
            {form.business_license_url && !form.businessLicenseFile && (
                <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs text-muted-foreground">
                  <CheckCircle size={11} className="text-emerald-500 shrink-0" />
                  <span className="truncate flex-1">{form.business_license_url}</span>
                  <button onClick={() => set({ business_license_url: null })} className="text-muted-foreground hover:text-red-500 transition-colors"><X size={11} /></button>
                </div>
            )}
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-5 text-center hover:border-primary/50 transition-colors cursor-pointer gap-1.5">
              <input ref={licenseRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => e.target.files?.[0] && set({ businessLicenseFile: e.target.files[0] })} />
              {form.businessLicenseFile
                  ? <div className="flex items-center gap-2 text-sm text-primary font-medium"><Upload size={13} />{form.businessLicenseFile.name}</div>
                  : <><Upload size={17} className="text-muted-foreground/40" /><p className="text-sm text-muted-foreground">클릭하여 업로드</p><p className="text-xs text-muted-foreground/50">JPG, PNG, PDF · 최대 10MB</p></>}
            </label>
          </Field>
        </PanelCard>

        {/* 연락처 & 위치 */}
        <PanelCard title="연락처 & 위치" icon={<MapPin size={13} />}>
          <Field label="사업장 주소" required>
            <div className="space-y-2">
              <input type="text" value={form.address} onChange={(e) => set({ address: e.target.value })} placeholder="도로명 주소" className={inputCls} />
              <input type="text" value={form.address_detail} onChange={(e) => set({ address_detail: e.target.value })} placeholder="상세 주소 (동/호수 등)" className={inputCls} />
            </div>
          </Field>
          <Field label="홈페이지 URL">
            <div className="relative">
              <Globe size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="url" value={form.website_url} onChange={(e) => set({ website_url: e.target.value })} placeholder="https://yourcompany.kr" className={`${inputCls} pl-8`} />
            </div>
          </Field>
        </PanelCard>

        {/* Save */}
        <button type="button" onClick={handleSave}
                disabled={saving || !form.name || !form.representative_name || !form.address}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-colors">
          {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />저장 중…</>
              : <><Save size={14} /> 변경 사항 저장</>}
        </button>

        {toast && <Toast message={toast} />}
      </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN  CompanySettings
// ════════════════════════════════════════════════════════════════════════════

export function CompanySettings() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("members");
  const now = new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });

  const currentNav = SIDEBAR_NAV.find((n) => n.key === activeTab)!;

  return (
      <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">

        {/* ── 헤더 — 대시보드와 동일한 다크 그라데이션 ── */}
        <div className="bg-gradient-to-r from-[#1a2744] to-[#243460] text-white rounded-xl p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Settings size={20} className="text-[#7eb3f5]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5 mb-0.5">
                  <h1 className="text-xl font-bold">회사 관리</h1>
                  <span className="text-xs bg-[#7eb3f5]/20 text-[#7eb3f5] border border-[#7eb3f5]/30 px-2 py-0.5 rounded font-medium">
                  (주)패션코리아
                </span>
                </div>
                <p className="text-blue-200/50 text-xs">{now}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                <Bell size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* ── ERP 2-col layout ── */}
        <div className="flex gap-6 items-start">

          {/* ── Sidebar ── */}
          <aside className="w-56 shrink-0">
            <nav className="bg-white border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/[0.03]">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">설정 메뉴</p>
              </div>
              <div className="p-2">
                {SIDEBAR_NAV.map((item) => {
                  const active = activeTab === item.key;
                  return (
                      <button key={item.key} onClick={() => setActiveTab(item.key)}
                              className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all mb-0.5 last:mb-0 group ${
                                  active
                                      ? "bg-primary text-white shadow-sm"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              }`}>
                    <span className={`mt-0.5 shrink-0 ${active ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {item.icon}
                    </span>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold leading-tight ${active ? "text-white" : ""}`}>{item.label}</p>
                          <p className={`text-[11px] mt-0.5 leading-tight ${active ? "text-white/60" : "text-muted-foreground/60"}`}>{item.desc}</p>
                        </div>
                        {active && <ChevronRight size={14} className="ml-auto mt-0.5 text-white/70 shrink-0" />}
                      </button>
                  );
                })}
              </div>

              {/* Company info snippet in sidebar */}
              <div className="mx-2 mb-2 p-3 rounded-lg bg-muted/30 border border-border/60">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                    <Layers size={11} className="text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground truncate">(주)패션코리아</span>
                </div>
                <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                  <ShieldCheck size={9} /> 셀러 승인
                </span>
                </div>
              </div>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
              <span>회사 관리</span>
              <ChevronRight size={11} />
              <span className="text-foreground font-medium">{currentNav.label}</span>
            </div>

            {activeTab === "members"   && <MembersTab />}
            {activeTab === "addresses" && <AddressesTab />}
            {activeTab === "company"   && <CompanyTab />}
          </main>
        </div>
      </div>
  );
}