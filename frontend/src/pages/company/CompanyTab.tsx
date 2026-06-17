import { useState, useRef } from "react";
import {
    Building2,
    Camera,
    CreditCard,
    FileText,
    Lock,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CompanyForm {
    name: string;
    businessNumber: string;
    representativeName: string;
    representativePhone: string;
    websiteUrl: string;
    description: string;
    address: string;
    addressDetail: string;
    logoUrl: string | null;
    businessLicenseUrl: string | null;
}

interface BankAccount {
    bankAccountId: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    isDefault: boolean;
    isVerified: boolean;
}

// ── Mock data (replace with API) ──────────────────────────────────────────────

const INITIAL_COMPANY: CompanyForm = {
    name: "패션코 주식회사",
    businessNumber: "123-45-67890",
    representativeName: "홍길동",
    representativePhone: "02-1234-5678",
    websiteUrl: "https://fashionco.kr",
    description: "국내외 패션 브랜드를 연결하는 B2B 플랫폼 전문 기업입니다.",
    address: "서울특별시 강남구 테헤란로 123",
    addressDetail: "패션빌딩 7층",
    logoUrl: null,
    businessLicenseUrl: null,
};

const INITIAL_ACCOUNTS: BankAccount[] = [
    {
        bankAccountId: 1,
        bankName: "국민은행",
        accountNumber: "123-456-789012",
        accountHolder: "패션코 주식회사",
        isDefault: true,
        isVerified: true,
    },
];

const BANK_OPTIONS = [
    "국민은행", "신한은행", "우리은행", "하나은행", "기업은행",
    "농협은행", "SC제일은행", "씨티은행", "카카오뱅크", "토스뱅크",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const readonlyCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted/40 text-muted-foreground cursor-not-allowed";
const textareaCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none";

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
    return (
        <div className="mb-4">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <span className="text-primary">{icon}</span>
                {title}
            </h2>
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5 ml-6">{subtitle}</p>}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        APPROVED: { label: "승인됨", cls: "bg-green-50 text-green-700 border-green-200" },
        PENDING:  { label: "심사중", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
        REJECTED: { label: "반려됨", cls: "bg-red-50 text-red-700 border-red-200" },
        NONE:     { label: "미신청", cls: "bg-muted/60 text-muted-foreground border-border" },
    };
    const { label, cls } = map[status] ?? map.NONE;
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
            {label}
        </span>
    );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function BankAccountCard({
                             account,
                             onDelete,
                             onSetDefault,
                         }: {
    account: BankAccount;
    onDelete: (id: number) => void;
    onSetDefault: (id: number) => void;
}) {
    return (
        <div
            className={`relative rounded-xl border p-4 transition-colors ${
                account.isDefault ? "border-primary/40 bg-primary/5" : "border-border bg-background"
            }`}
        >
            {account.isDefault && (
                <span className="absolute top-3 right-3 text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    기본 계좌
                </span>
            )}

            <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                    <CreditCard size={16} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{account.bankName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{account.accountNumber}</p>
                    <p className="text-xs text-muted-foreground">{account.accountHolder}</p>

                    <div className="flex items-center gap-1.5 mt-2">
                        {account.isVerified ? (
                            <span className="flex items-center gap-1 text-xs text-green-600">
                                <CheckCircle2 size={11} />
                                인증 완료
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-xs text-yellow-600">
                                <AlertCircle size={11} />
                                인증 필요
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
                {!account.isDefault && (
                    <button
                        onClick={() => onSetDefault(account.bankAccountId)}
                        className="text-xs text-primary hover:underline font-medium"
                    >
                        기본으로 설정
                    </button>
                )}
                {!account.isVerified && (
                    <button className="text-xs text-blue-600 hover:underline font-medium">
                        1원 인증하기
                    </button>
                )}
                <button
                    onClick={() => onDelete(account.bankAccountId)}
                    className="ml-auto text-muted-foreground hover:text-red-500 transition-colors"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

function AddBankAccountForm({ onAdd, onCancel }: { onAdd: (a: BankAccount) => void; onCancel: () => void }) {
    const [form, setForm] = useState({ bankName: "", accountNumber: "", accountHolder: "" });
    const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));
    const valid = form.bankName && form.accountNumber && form.accountHolder;

    const handleSubmit = () => {
        if (!valid) return;
        onAdd({
            bankAccountId: Date.now(),
            ...form,
            isDefault: false,
            isVerified: false,
        });
    };

    return (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 space-y-3">
            <p className="text-sm font-semibold text-foreground">새 계좌 추가</p>

            {/* Bank select */}
            <div className="relative">
                <select
                    value={form.bankName}
                    onChange={(e) => set({ bankName: e.target.value })}
                    className="w-full appearance-none border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-background pr-8"
                >
                    <option value="">은행 선택</option>
                    {BANK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            <input
                type="text"
                placeholder="계좌번호 (- 없이 입력)"
                value={form.accountNumber}
                onChange={(e) => set({ accountNumber: e.target.value })}
                className={inputCls}
            />
            <input
                type="text"
                placeholder="예금주명"
                value={form.accountHolder}
                onChange={(e) => set({ accountHolder: e.target.value })}
                className={inputCls}
            />

            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleSubmit}
                    disabled={!valid}
                    className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white py-2 rounded-lg text-sm font-semibold transition-colors"
                >
                    추가
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 border border-border text-muted-foreground hover:text-foreground py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    취소
                </button>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function CompanyTab() {
    const [form, setForm]               = useState<CompanyForm>(INITIAL_COMPANY);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [licensePreview, setLicensePreview] = useState<string | null>(null);
    const [accounts, setAccounts]       = useState<BankAccount[]>(INITIAL_ACCOUNTS);
    const [showAddAccount, setShowAddAccount] = useState(false);
    const [saving, setSaving]           = useState(false);
    const [saved, setSaved]             = useState(false);

    const logoRef    = useRef<HTMLInputElement>(null);
    const licenseRef = useRef<HTMLInputElement>(null);

    const set = (p: Partial<CompanyForm>) => setForm((f) => ({ ...f, ...p }));

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        onLoad: (result: string) => void,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onLoad(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        setSaving(true);
        // TODO: PATCH /companies/:id
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }, 800);
    };

    const handleDeleteAccount = (id: number) =>
        setAccounts((prev) => prev.filter((a) => a.bankAccountId !== id));

    const handleSetDefault = (id: number) =>
        setAccounts((prev) =>
            prev.map((a) => ({ ...a, isDefault: a.bankAccountId === id })),
        );

    const handleAddAccount = (account: BankAccount) => {
        setAccounts((prev) => [...prev, account]);
        setShowAddAccount(false);
    };

    const logoSrc     = logoPreview ?? form.logoUrl;
    const companyInit = form.name.slice(0, 2);

    return (
        <div className="space-y-8">

            {/* ── 회사 기본 정보 ── */}
            <section>
                <SectionHeader
                    icon={<Building2 size={16} />}
                    title="회사 기본 정보"
                />

                {/* Logo */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div
                            onClick={() => logoRef.current?.click()}
                            className="w-20 h-20 rounded-2xl bg-primary/10 text-primary font-black text-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 border-border hover:border-primary/50 transition-colors group"
                        >
                            {logoSrc ? (
                                <img src={logoSrc} alt="회사 로고" className="w-full h-full object-cover" />
                            ) : (
                                companyInit
                            )}
                            <div className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={18} className="text-white" />
                            </div>
                        </div>
                        <input
                            ref={logoRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileChange(e, setLogoPreview)}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{form.name}</p>
                        <button
                            onClick={() => logoRef.current?.click()}
                            className="text-xs text-primary hover:underline mt-0.5"
                        >
                            로고 변경
                        </button>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                    {/* 사업자등록번호 — read-only */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5 flex items-center gap-1.5">
                            사업자등록번호
                            <Lock size={11} className="text-muted-foreground/50" />
                        </label>
                        <input
                            type="text"
                            value={form.businessNumber}
                            readOnly
                            className={readonlyCls}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            사업자등록번호는 변경할 수 없습니다. 정정이 필요하면 고객센터에 문의해 주세요.
                        </p>
                    </div>

                    {/* 회사명 */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">
                            회사명 <span className="text-primary text-xs">(필수)</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set({ name: e.target.value })}
                            placeholder="패션코 주식회사"
                            className={inputCls}
                        />
                    </div>

                    {/* 대표자 2열 */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-[#333] mb-1.5">대표자명</label>
                            <input
                                type="text"
                                value={form.representativeName}
                                onChange={(e) => set({ representativeName: e.target.value })}
                                placeholder="홍길동"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#333] mb-1.5">대표 연락처</label>
                            <input
                                type="tel"
                                value={form.representativePhone}
                                onChange={(e) => set({ representativePhone: e.target.value })}
                                placeholder="02-0000-0000"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* 웹사이트 */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">웹사이트</label>
                        <input
                            type="url"
                            value={form.websiteUrl}
                            onChange={(e) => set({ websiteUrl: e.target.value })}
                            placeholder="https://example.com"
                            className={inputCls}
                        />
                    </div>

                    {/* 주소 */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">회사 주소</label>
                        <div className="space-y-2">
                            <input
                                type="text"
                                value={form.address}
                                onChange={(e) => set({ address: e.target.value })}
                                placeholder="기본 주소"
                                className={inputCls}
                            />
                            <input
                                type="text"
                                value={form.addressDetail}
                                onChange={(e) => set({ addressDetail: e.target.value })}
                                placeholder="상세 주소"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    {/* 회사 소개 */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">회사 소개</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => set({ description: e.target.value })}
                            placeholder="바이어/셀러에게 보여질 회사 소개를 입력해 주세요."
                            rows={3}
                            maxLength={2000}
                            className={textareaCls}
                        />
                        <p className="text-xs text-muted-foreground mt-1 text-right">
                            {form.description.length} / 2000
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || !form.name.trim()}
                    className="mt-5 flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                    {saving ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            저장 중...
                        </>
                    ) : saved ? (
                        "✓ 저장되었습니다"
                    ) : (
                        "정보 저장"
                    )}
                </button>
            </section>

            {/* ── 사업자등록증 ── */}
            <section className="pt-6 border-t border-border">
                <SectionHeader
                    icon={<FileText size={16} />}
                    title="사업자등록증"
                    subtitle="심사 및 셀러 신청에 사용됩니다."
                />

                <div
                    onClick={() => licenseRef.current?.click()}
                    className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/20 hover:bg-primary/5 transition-colors cursor-pointer py-8"
                >
                    {licensePreview ? (
                        <img
                            src={licensePreview}
                            alt="사업자등록증"
                            className="max-h-48 object-contain rounded-lg"
                        />
                    ) : form.businessLicenseUrl ? (
                        <div className="flex flex-col items-center gap-1">
                            <FileText size={28} className="text-primary" />
                            <p className="text-sm font-medium text-foreground">등록된 파일 있음</p>
                            <p className="text-xs text-primary group-hover:underline">클릭하여 변경</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <FileText size={28} className="text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">클릭하여 파일 업로드</p>
                            <p className="text-xs text-muted-foreground/60">JPG, PNG, PDF · 최대 10MB</p>
                        </div>
                    )}
                    <input
                        ref={licenseRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, setLicensePreview)}
                    />
                </div>
            </section>

            {/* ── 정산 계좌 ── */}
            <section className="pt-6 border-t border-border">
                <SectionHeader
                    icon={<CreditCard size={16} />}
                    title="정산 계좌"
                    subtitle="판매 대금 정산에 사용되는 계좌입니다."
                />

                <div className="space-y-3">
                    {accounts.map((account) => (
                        <BankAccountCard
                            key={account.bankAccountId}
                            account={account}
                            onDelete={handleDeleteAccount}
                            onSetDefault={handleSetDefault}
                        />
                    ))}

                    {showAddAccount ? (
                        <AddBankAccountForm
                            onAdd={handleAddAccount}
                            onCancel={() => setShowAddAccount(false)}
                        />
                    ) : (
                        <button
                            onClick={() => setShowAddAccount(true)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 py-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Plus size={14} />
                            계좌 추가
                        </button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                    계좌 추가 후 1원 인증을 완료해야 정산이 가능합니다.
                    기본 계좌로 설정된 계좌로 정산금이 지급됩니다.
                </p>
            </section>
        </div>
    );
}