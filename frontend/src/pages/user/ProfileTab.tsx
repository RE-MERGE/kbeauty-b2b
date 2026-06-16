import { useState, useRef } from "react";
import { User, Camera, AlertTriangle, Lock } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ProfileForm {
    name: string;
    phone: string;
    profileImageUrl: string | null;
}

// ── Mock data (replace with API) ──────────────────────────────────────────────

const INITIAL: ProfileForm = {
    name: "홍길동",
    phone: "010-1234-5678",
    profileImageUrl: null,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors";
const readonlyCls =
    "w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-muted/40 text-muted-foreground cursor-not-allowed";

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <h2 className="flex items-center gap-2 text-base font-bold text-foreground mb-4">
            <span className="text-primary">{icon}</span>
            {title}
        </h2>
    );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProfileTab() {
    const [form, setForm]                 = useState<ProfileForm>(INITIAL);
    const [preview, setPreview]           = useState<string | null>(null);
    const [saving, setSaving]             = useState(false);
    const [saved, setSaved]               = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const imgRef                          = useRef<HTMLInputElement>(null);

    const set = (p: Partial<ProfileForm>) => setForm((f) => ({ ...f, ...p }));

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        setSaving(true);
        // TODO: PATCH /users/me
        setTimeout(() => {
            setSaving(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        }, 800);
    };

    const avatarSrc = preview ?? form.profileImageUrl;
    const initials  = form.name.slice(0, 2);

    return (
        <div className="space-y-8">
            {/* ── 내 정보 ── */}
            <section>
                <SectionHeader icon={<User size={16} />} title="내 정보" />

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                        <div
                            onClick={() => imgRef.current?.click()}
                            className="w-20 h-20 rounded-full bg-primary/10 text-primary font-black text-lg flex items-center justify-center overflow-hidden cursor-pointer border-2 border-border hover:border-primary/50 transition-colors group"
                        >
                            {avatarSrc ? (
                                <img src={avatarSrc} alt="프로필" className="w-full h-full object-cover" />
                            ) : (
                                initials
                            )}
                            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={18} className="text-white" />
                            </div>
                        </div>
                        <input
                            ref={imgRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">{form.name}</p>
                        <button
                            onClick={() => imgRef.current?.click()}
                            className="text-xs text-primary hover:underline mt-0.5"
                        >
                            사진 변경
                        </button>
                    </div>
                </div>

                {/* Fields */}
                <div className="space-y-4">
                    {/* Email — read-only */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5 flex items-center gap-1.5">
                            이메일
                            <Lock size={11} className="text-muted-foreground/50" />
                        </label>
                        <input
                            type="email"
                            value="hong@fashionco.kr"
                            readOnly
                            className={readonlyCls}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            이메일은 변경할 수 없습니다. 변경이 필요하면 고객센터에 문의해 주세요.
                        </p>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">
                            이름 <span className="text-primary text-xs">(필수)</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => set({ name: e.target.value })}
                            placeholder="홍길동"
                            className={inputCls}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">연락처</label>
                        <input
                            type="tel"
                            value={form.phone}
                            onChange={(e) => set({ phone: e.target.value })}
                            placeholder="010-0000-0000"
                            className={inputCls}
                        />
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

            {/* ── 회원 탈퇴 ── */}
            <section className="pt-6 border-t border-border">
                <SectionHeader icon={<AlertTriangle size={16} />} title="회원 탈퇴" />
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    탈퇴 시 모든 주문 내역, 문의 내역, 개인정보가 삭제되며 복구할 수 없습니다.
                    진행 중인 주문이 있으면 탈퇴할 수 없습니다.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="border border-red-300 text-red-600 hover:bg-red-50 px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        회원 탈퇴 신청
                    </button>
                ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-red-700 mb-3">정말로 탈퇴하시겠습니까?</p>
                        <p className="text-xs text-red-600 mb-4 leading-relaxed">
                            이 작업은 되돌릴 수 없습니다. 계정에 연결된 모든 데이터가 영구 삭제됩니다.
                        </p>
                        <div className="flex gap-2">
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                                탈퇴 확인
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="border border-border text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}