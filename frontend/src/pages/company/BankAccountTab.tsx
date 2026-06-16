import { useState } from "react";
import {
    CreditCard,
    Plus,
    Trash2,
    CheckCircle2,
    AlertCircle,
    ChevronDown,
    Star,
    ShieldCheck,
    Landmark,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BankAccount {
    bankAccountId: number;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    isDefault: boolean;
    isVerified: boolean;
}

// ── Mock data (replace with API) ──────────────────────────────────────────────

const INITIAL_ACCOUNTS: BankAccount[] = [
    {
        bankAccountId: 1,
        bankName: "국민은행",
        accountNumber: "123-456-789012",
        accountHolder: "패션코 주식회사",
        isDefault: true,
        isVerified: true,
    },
    {
        bankAccountId: 2,
        bankName: "신한은행",
        accountNumber: "110-123-456789",
        accountHolder: "패션코 주식회사",
        isDefault: false,
        isVerified: false,
    },
];

const BANK_OPTIONS = [
    "국민은행", "신한은행", "우리은행", "하나은행", "기업은행",
    "농협은행", "SC제일은행", "씨티은행", "카카오뱅크", "토스뱅크",
    "케이뱅크", "수협은행", "대구은행", "부산은행",
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-background";

function maskAccount(num: string) {
    const clean = num.replace(/-/g, "");
    if (clean.length < 5) return num;
    return num.slice(0, -4).replace(/\d/g, "•") + num.slice(-4);
}

// ── Empty State ───────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                <Landmark size={28} className="text-muted-foreground/50" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">등록된 계좌가 없어요</p>
            <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
                정산을 받으려면 계좌를 먼저 등록하고<br />1원 인증을 완료해 주세요.
            </p>
            <button
                onClick={onAdd}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
            >
                <Plus size={14} />
                계좌 등록하기
            </button>
        </div>
    );
}

// ── Account Card ──────────────────────────────────────────────────────────────

function AccountCard({
    account,
    onDelete,
    onSetDefault,
    onVerify,
}: {
    account: BankAccount;
    onDelete: (id: number) => void;
    onSetDefault: (id: number) => void;
    onVerify: (id: number) => void;
}) {
    const [confirmDelete, setConfirmDelete] = useState(false);

    return (
        <div
            className={`rounded-2xl border transition-all ${
                account.isDefault
                    ? "border-primary/30 bg-gradient-to-br from-primary/5 to-primary/[0.02] shadow-sm"
                    : "border-border bg-background hover:border-border/80"
            }`}
        >
            <div className="p-5">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                        {/* Bank icon */}
                        <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                account.isDefault ? "bg-primary/15" : "bg-muted/60"
                            }`}
                        >
                            <CreditCard
                                size={18}
                                className={account.isDefault ? "text-primary" : "text-muted-foreground"}
                            />
                        </div>

                        <div>
                            <div className="flex items-center gap-1.5">
                                <p className="text-sm font-bold text-foreground">{account.bankName}</p>
                                {account.isDefault && (
                                    <span className="flex items-center gap-0.5 text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                        <Star size={9} fill="currentColor" />
                                        기본
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 font-mono tracking-wide">
                                {maskAccount(account.accountNumber)}
                            </p>
                        </div>
                    </div>

                    {/* Verified badge */}
                    {account.isVerified ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded-full flex-shrink-0">
                            <ShieldCheck size={11} />
                            인증 완료
                        </span>
                    ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full flex-shrink-0">
                            <AlertCircle size={11} />
                            미인증
                        </span>
                    )}
                </div>

                {/* Holder */}
                <div className="bg-muted/40 rounded-lg px-3 py-2 mb-4">
                    <p className="text-xs text-muted-foreground">예금주</p>
                    <p className="text-sm font-medium text-foreground mt-0.5">{account.accountHolder}</p>
                </div>

                {/* Actions */}
                {confirmDelete ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                        <p className="text-xs font-semibold text-red-700 mb-2">이 계좌를 삭제할까요?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onDelete(account.bankAccountId)}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                                삭제
                            </button>
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 border border-border text-muted-foreground hover:text-foreground py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {!account.isVerified && (
                            <button
                                onClick={() => onVerify(account.bankAccountId)}
                                className="flex-1 border border-primary/40 text-primary hover:bg-primary/5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                            >
                                1원 인증하기
                            </button>
                        )}
                        {!account.isDefault && (
                            <button
                                onClick={() => onSetDefault(account.bankAccountId)}
                                className="flex-1 border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                                기본 계좌로 설정
                            </button>
                        )}
                        <button
                            onClick={() => setConfirmDelete(true)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors ml-auto"
                        >
                            <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Add Account Form ──────────────────────────────────────────────────────────

function AddAccountForm({ onAdd, onCancel }: { onAdd: (a: BankAccount) => void; onCancel: () => void }) {
    const [form, setForm] = useState({ bankName: "", accountNumber: "", accountHolder: "" });
    const [submitting, setSubmitting] = useState(false);
    const set = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

    const valid = form.bankName && form.accountNumber.trim() && form.accountHolder.trim();

    const handleSubmit = () => {
        if (!valid) return;
        setSubmitting(true);
        setTimeout(() => {
            onAdd({
                bankAccountId: Date.now(),
                ...form,
                isDefault: false,
                isVerified: false,
            });
            setSubmitting(false);
        }, 600);
    };

    return (
        <div className="rounded-2xl border border-primary/20 bg-primary/[0.02] p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus size={13} className="text-primary" />
                </div>
                <p className="text-sm font-bold text-foreground">새 계좌 추가</p>
            </div>

            {/* Bank select */}
            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">은행</label>
                <div className="relative">
                    <select
                        value={form.bankName}
                        onChange={(e) => set({ bankName: e.target.value })}
                        className="w-full appearance-none border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors bg-background pr-8"
                    >
                        <option value="">은행 선택</option>
                        {BANK_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">계좌번호</label>
                <input
                    type="text"
                    placeholder="숫자만 입력"
                    value={form.accountNumber}
                    onChange={(e) => set({ accountNumber: e.target.value })}
                    className={inputCls}
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">예금주명</label>
                <input
                    type="text"
                    placeholder="예금주명 입력"
                    value={form.accountHolder}
                    onChange={(e) => set({ accountHolder: e.target.value })}
                    className={inputCls}
                />
            </div>

            <p className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 leading-relaxed">
                계좌 추가 후 <span className="font-semibold text-foreground">1원 인증</span>을 완료해야 정산이 가능합니다.
            </p>

            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleSubmit}
                    disabled={!valid || submitting}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 text-white py-2.5 rounded-lg text-sm font-semibold transition-colors"
                >
                    {submitting ? (
                        <>
                            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            추가 중...
                        </>
                    ) : "계좌 추가"}
                </button>
                <button
                    onClick={onCancel}
                    className="flex-1 border border-border text-muted-foreground hover:text-foreground py-2.5 rounded-lg text-sm font-medium transition-colors"
                >
                    취소
                </button>
            </div>
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function BankAccountTab() {
    const [accounts, setAccounts]           = useState<BankAccount[]>(INITIAL_ACCOUNTS);
    const [showAddForm, setShowAddForm]     = useState(false);

    const handleDelete = (id: number) =>
        setAccounts((prev) => prev.filter((a) => a.bankAccountId !== id));

    const handleSetDefault = (id: number) =>
        setAccounts((prev) =>
            prev.map((a) => ({ ...a, isDefault: a.bankAccountId === id })),
        );

    const handleVerify = (id: number) => {
        // TODO: POST /company/bank-accounts/:id/verify
        alert(`1원 인증 요청 (id: ${id})`);
    };

    const handleAdd = (account: BankAccount) => {
        setAccounts((prev) => [...prev, account]);
        setShowAddForm(false);
    };

    const verifiedCount = accounts.filter((a) => a.isVerified).length;

    return (
        <div className="space-y-6">

            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                        <span className="text-primary"><CreditCard size={16} /></span>
                        정산 계좌 관리
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                        판매 대금은 기본 계좌로 지급됩니다.
                    </p>
                </div>

                {accounts.length > 0 && !showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-1.5 border border-border hover:border-primary/50 hover:text-primary text-muted-foreground px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex-shrink-0"
                    >
                        <Plus size={13} />
                        계좌 추가
                    </button>
                )}
            </div>

            {/* ── Summary bar ── */}
            {accounts.length > 0 && (
                <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-muted/20 overflow-hidden">
                    {[
                        { label: "등록 계좌", value: `${accounts.length}개` },
                        { label: "인증 완료", value: `${verifiedCount}개` },
                        { label: "기본 계좌", value: accounts.find((a) => a.isDefault)?.bankName ?? "-" },
                    ].map(({ label, value }) => (
                        <div key={label} className="px-4 py-3 text-center">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
                            <p className="text-sm font-bold text-foreground mt-0.5">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Content ── */}
            {accounts.length === 0 && !showAddForm ? (
                <EmptyState onAdd={() => setShowAddForm(true)} />
            ) : (
                <div className="space-y-3">
                    {accounts.map((account) => (
                        <AccountCard
                            key={account.bankAccountId}
                            account={account}
                            onDelete={handleDelete}
                            onSetDefault={handleSetDefault}
                            onVerify={handleVerify}
                        />
                    ))}

                    {showAddForm ? (
                        <AddAccountForm onAdd={handleAdd} onCancel={() => setShowAddForm(false)} />
                    ) : (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 py-4 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            <Plus size={14} />
                            계좌 추가
                        </button>
                    )}
                </div>
            )}

            {/* ── Notice ── */}
            {accounts.length > 0 && (
                <div className="flex gap-2.5 bg-muted/30 rounded-xl p-4">
                    <CheckCircle2 size={15} className="text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        계좌 인증은 소액(1원) 송금으로 진행됩니다. 인증 완료 후 정산이 가능하며,
                        기본 계좌가 미인증 상태면 정산이 보류될 수 있습니다.
                    </p>
                </div>
            )}
        </div>
    );
}
