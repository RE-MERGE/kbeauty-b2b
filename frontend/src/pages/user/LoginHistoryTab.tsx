import { useState } from "react";
import { Clock, Shield, AlertTriangle, Monitor, Smartphone, Globe, CheckCircle } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface LoginRecord {
    id: number;
    ip: string;
    device: "desktop" | "mobile" | "unknown";
    os: string;
    location: string;           // reverse geocoded (best-effort)
    loginAt: string;
    status: "SUCCESS" | "FAILED";
}

// ── Mock data (replace with GET /users/me/login-history) ─────────────────────

const MOCK_HISTORY: LoginRecord[] = [
    {
        id: 1, ip: "211.234.12.88",  device: "desktop", os: "macOS · Chrome",
        location: "서울, 한국",  loginAt: "2026.06.13 09:12", status: "SUCCESS",
    },
    {
        id: 2, ip: "211.234.12.88",  device: "mobile",  os: "iOS · Safari",
        location: "서울, 한국",  loginAt: "2026.06.12 22:04", status: "SUCCESS",
    },
    {
        id: 3, ip: "175.45.116.32",  device: "desktop", os: "Windows · Chrome",
        location: "부산, 한국",  loginAt: "2026.06.11 14:37", status: "SUCCESS",
    },
    {
        id: 4, ip: "203.0.113.55",   device: "unknown", os: "알 수 없음",
        location: "미국, 시카고", loginAt: "2026.06.10 03:21", status: "FAILED",
    },
    {
        id: 5, ip: "203.0.113.55",   device: "unknown", os: "알 수 없음",
        location: "미국, 시카고", loginAt: "2026.06.10 03:19", status: "FAILED",
    },
    {
        id: 6, ip: "118.32.97.210",  device: "desktop", os: "macOS · Safari",
        location: "서울, 한국",  loginAt: "2026.06.09 18:50", status: "SUCCESS",
    },
];

// DB snapshot — from users row
const USER_SECURITY = {
    lastLoginAt:         "2026.06.13 09:12",
    lastLoginIp:         "211.234.12.88",
    failedLoginAttempts: 2,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function DeviceIcon({ device }: { device: LoginRecord["device"] }) {
    if (device === "mobile") return <Smartphone size={14} className="text-muted-foreground" />;
    if (device === "desktop") return <Monitor size={14} className="text-muted-foreground" />;
    return <Globe size={14} className="text-muted-foreground" />;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LoginHistoryTab() {
    const [showAll, setShowAll] = useState(false);

    const hasFailed = USER_SECURITY.failedLoginAttempts > 0;
    const visible   = showAll ? MOCK_HISTORY : MOCK_HISTORY.slice(0, 5);

    return (
        <div className="space-y-6">
        <div>
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-1">
        <Clock size={16} className="text-primary" /> 로그인 기록
    </h2>
    <p className="text-xs text-muted-foreground">
        최근 30일 이내의 로그인 기록을 확인할 수 있습니다.
    </p>
    </div>

    {/* Summary cards */}
    <div className="grid grid-cols-3 gap-3">
    <div className="border border-border rounded-lg px-4 py-3">
    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">
        최근 로그인
    </p>
    <p className="text-sm font-bold text-foreground">{USER_SECURITY.lastLoginAt}</p>
        </div>
        <div className="border border-border rounded-lg px-4 py-3">
    <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide mb-1">
        최근 IP
    </p>
    <p className="text-sm font-bold text-foreground font-mono">{USER_SECURITY.lastLoginIp}</p>
        </div>
        <div className={`border rounded-lg px-4 py-3 ${hasFailed ? "border-red-200 bg-red-50" : "border-border"}`}>
    <p className={`text-[11px] font-semibold uppercase tracking-wide mb-1 ${hasFailed ? "text-red-500" : "text-muted-foreground"}`}>
    로그인 실패
    </p>
    <p className={`text-sm font-bold ${hasFailed ? "text-red-600" : "text-foreground"}`}>
    {USER_SECURITY.failedLoginAttempts}회
    </p>
    </div>
    </div>

    {/* Warning if suspicious login */}
    {MOCK_HISTORY.some((r) => r.status === "FAILED") && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3.5">
        <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
    <div>
        <p className="text-sm font-semibold text-amber-800">의심스러운 로그인 시도가 감지되었습니다.</p>
    <p className="text-xs text-amber-700 mt-0.5">
        낯선 위치(미국, 시카고)에서 연속 로그인 실패가 발생했습니다.
        본인이 아니라면 즉시 비밀번호를 변경해 주세요.
    </p>
    </div>
    </div>
    )}

    {/* History table */}
    <div className="border border-border rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_140px_80px] gap-4 px-5 py-2.5 bg-muted/30 border-b border-border">
        {["기기 / 위치", "IP 주소", "일시", "결과"].map((h) => (
        <span key={h} className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {h}
        </span>
))}
    </div>

    <div className="divide-y divide-border">
        {visible.map((rec) => (
                <div
                    key={rec.id}
            className={`grid grid-cols-[1fr_120px_140px_80px] gap-4 px-5 py-3.5 items-center text-sm ${
                rec.status === "FAILED" ? "bg-red-50/50" : "hover:bg-muted/[0.04]"
            } transition-colors`}
        >
        {/* Device + location */}
        <div className="flex items-center gap-2.5 min-w-0">
    <DeviceIcon device={rec.device} />
    <div className="min-w-0">
    <p className="text-xs font-semibold text-foreground truncate">{rec.os}</p>
        <p className="text-[11px] text-muted-foreground truncate">
    <Globe size={10} className="inline mr-1" />
        {rec.location}
        </p>
        </div>
        </div>

    {/* IP */}
    <span className="text-xs font-mono text-muted-foreground">{rec.ip}</span>

    {/* Time */}
    <span className="text-xs text-muted-foreground">{rec.loginAt}</span>

    {/* Status */}
    <div>
        {rec.status === "SUCCESS" ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                <CheckCircle size={12} /> 성공
                </span>
) : (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-500">
        <AlertTriangle size={12} /> 실패
    </span>
)}
    </div>
    </div>
))}
    </div>
    </div>

    {MOCK_HISTORY.length > 5 && (
        <button
            onClick={() => setShowAll((v) => !v)}
        className="w-full py-2.5 text-sm text-muted-foreground hover:text-primary border border-border rounded-lg hover:border-primary/30 transition-colors"
            >
            {showAll ? "접기" : `전체 기록 보기 (${MOCK_HISTORY.length}건)`}
            </button>
    )}

    {/* Security tip */}
    <div className="flex items-start gap-2.5 bg-muted/30 border border-border rounded-lg px-4 py-3.5">
    <Shield size={14} className="text-primary shrink-0 mt-0.5" />
    <p className="text-xs text-muted-foreground leading-relaxed">
        알 수 없는 기기나 해외 IP에서 로그인이 확인되면 즉시 비밀번호를 변경하고
    연결된 소셜 계정의 비밀번호도 함께 변경하세요.
    </p>
    </div>
    </div>
);
}