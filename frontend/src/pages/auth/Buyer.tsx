import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function RegisterBuyer() {
    const navigate = useNavigate();
    const [agreed, setAgreed] = useState(false);
    const [form, setForm] = useState({
        companyName: "",
        contactName: "",
        businessNo: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    return (
        <div>
            <div className="flex items-center gap-3 mb-5">
                <Link to="/auth/register" className="text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft size={18} />
                </Link>
                <div>
                    <h2 className="text-xl font-bold text-foreground leading-tight">바이어 회원가입</h2>
                    <p className="text-sm text-muted-foreground">가입 후 담당자 확인을 거쳐 계정이 활성화됩니다.</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">법인명 / 상호명</label>
                    <input
                        type="text"
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                        placeholder="(주)패션코리아 / 홍길동 의류"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">사업자등록번호</label>
                    <input
                        type="text"
                        value={form.businessNo}
                        onChange={(e) => setForm({ ...form, businessNo: e.target.value })}
                        placeholder="000-00-00000"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">담당자명</label>
                    <input
                        type="text"
                        value={form.contactName}
                        onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                        placeholder="홍길동"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">휴대폰 번호</label>
                    <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="010-0000-0000"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">이메일</label>
                    <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@company.com"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호</label>
                    <input
                        type="password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        placeholder="8자 이상"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호 확인</label>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        placeholder="비밀번호 재입력"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                </div>
            </div>

            <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer mt-5">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 flex-shrink-0"
                />
                <span>
          <a href="#" className="text-primary underline">이용약관</a> 및{" "}
                    <a href="#" className="text-primary underline">개인정보 처리방침</a>에 동의합니다.
        </span>
            </label>

            <button
                type="button"
                onClick={() => navigate("/auth/register/success")}
                className="w-full mt-5 bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
                바이어로 가입하기 <ArrowRight size={16} />
            </button>
        </div>
    );
}