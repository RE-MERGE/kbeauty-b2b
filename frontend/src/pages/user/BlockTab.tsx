import { useState } from "react";
import { Ban, Search, Building2, X, AlertCircle, CheckCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface BlockedCompany {
    companyId: number;
    companyName: string;
    businessNumber: string;
    logoUrl: string | null;
    blockedAt: string;
    reason: string | null;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_BLOCKED: BlockedCompany[] = [
    {
        companyId: 101,
        companyName: "(주)불량공급사",
        businessNumber: "111-22-33333",
        logoUrl: null,
        blockedAt: "2024.05.12",
        reason: "허위 상품 정보 등록",
    },
    {
        companyId: 102,
        companyName: "스캠도매㈜",
        businessNumber: "444-55-66666",
        logoUrl: null,
        blockedAt: "2024.04.08",
        reason: "결제 후 연락 두절",
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function BlockTab() {
    const [blocked, setBlocked]   = useState<BlockedCompany[]>(MOCK_BLOCKED);
    const [search, setSearch]     = useState("");
    const [unblocking, setUnblocking] = useState<number | null>(null);
    const [toast, setToast]       = useState<{ msg: string; type: "ok" | "err" } | null>(null);

    const showToast = (msg: string, type: "ok" | "err" = "ok") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 2500);
    };

    const handleUnblock = (id: number, name: string) => {
        setUnblocking(id);
        // TODO: DELETE /blocks/:companyId
        setTimeout(() => {
            setBlocked((prev) => prev.filter((b) => b.companyId !== id));
            setUnblocking(null);
            showToast(`${name} 차단을 해제했습니다.`);
        }, 700);
    };

    const visible = blocked.filter((b) => {
        const q = search.trim().toLowerCase();
        return !q || b.companyName.toLowerCase().includes(q) || b.businessNumber.includes(q);
    });

    return (
        <div className="space-y-5">
            <div>
                <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-1">
                    <Ban size={16} className="text-primary" /> 차단 관리
                </h2>
                <p className="text-xs text-muted-foreground">
                    차단한 업체는 내 상품 및 문의를 볼 수 없으며 거래 요청을 보낼 수 없습니다.
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="업체명 또는 사업자번호 검색"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                />
            </div>

            {/* Count */}
            <p className="text-xs text-muted-foreground">
                차단 업체 <strong className="text-foreground">{blocked.length}개</strong>
            </p>

            {/* List */}
            {visible.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-center">
                    <Ban size={28} className="text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">
                        {search ? "검색 결과가 없습니다." : "차단한 업체가 없습니다."}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visible.map((b) => (
                        <div
                            key={b.companyId}
                            className="flex items-center gap-4 border border-border rounded-xl px-4 py-3.5 hover:border-border/80 transition-colors"
                        >
                            {/* Logo / initials */}
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                                {b.logoUrl ? (
                                    <img src={b.logoUrl} alt={b.companyName} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <Building2 size={16} className="text-muted-foreground" />
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{b.companyName}</p>
                                <p className="text-xs text-muted-foreground">
                                    사업자 {b.businessNumber} · 차단일 {b.blockedAt}
                                </p>
                                {b.reason && (
                                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                                        <AlertCircle size={10} className="shrink-0" /> {b.reason}
                                    </p>
                                )}
                            </div>

                            {/* Unblock */}
                            <button
                                onClick={() => handleUnblock(b.companyId, b.companyName)}
                                disabled={unblocking === b.companyId}
                                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                            >
                                {unblocking === b.companyId ? (
                                    <span className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                                ) : (
                                    <X size={12} />
                                )}
                                차단 해제
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="flex items-start gap-2.5 bg-muted/30 border border-border rounded-lg px-4 py-3.5">
                <AlertCircle size={13} className="text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                    차단 해제 후 해당 업체가 다시 내 상품이나 문의를 볼 수 있게 됩니다.
                    업체를 차단하려면 해당 업체 프로필 페이지에서 차단 버튼을 사용하세요.
                </p>
            </div>

            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 text-sm font-medium px-5 py-3 rounded-full shadow-lg flex items-center gap-2 ${
                    toast.type === "ok"
                        ? "bg-foreground text-background"
                        : "bg-red-600 text-white"
                }`}>
                    <CheckCircle size={14} className={toast.type === "ok" ? "text-emerald-400" : "text-white"} />
                    {toast.msg}
                </div>
            )}
        </div>
    );
}