import { useState } from "react";
import { Link } from "react-router";
import { Eye, EyeOff } from "lucide-react";

export function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ email: "", password: "", remember: false });

    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-6">로그인</h2>
            <div className="space-y-4">
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
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="비밀번호 입력"
                            className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors pr-10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={form.remember}
                            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
                            className="rounded"
                        />
                        로그인 상태 유지
                    </label>
                    <Link to="/auth/find-pw" className="text-primary hover:underline">
                        아이디·비밀번호 찾기
                    </Link>
                </div>
                <Link
                    to="/buyer"
                    className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center"
                >
                    로그인
                </Link>
            </div>
            <div className="mt-5 text-center text-sm text-muted-foreground">
                계정이 없으신가요?{" "}
                <Link to="/auth/register" className="text-primary font-semibold hover:underline">
                    회원가입
                </Link>
            </div>
        </div>
    );
}