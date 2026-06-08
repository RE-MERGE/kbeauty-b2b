import { useState } from "react";
import { Link } from "react-router";
import { Mail, KeyRound, ArrowRight, CheckCircle } from "lucide-react";

function FindSubTabs() {
    return (
        <div className="flex border border-border rounded overflow-hidden mb-6">
            <Link
                to="/auth/find-id"
                className="flex-1 py-2.5 text-sm font-semibold transition-colors text-center bg-white text-muted-foreground hover:text-primary"
            >
                <Mail size={14} className="inline mr-1.5" />아이디 찾기
            </Link>
            <span className="flex-1 py-2.5 text-sm font-semibold text-center bg-secondary text-primary border-b-2 border-primary">
        <KeyRound size={14} className="inline mr-1.5" />비밀번호 찾기
      </span>
        </div>
    );
}

export function FindPw() {
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [submitted, setSubmitted] = useState(false);

    return (
        <>
            <h2 className="text-xl font-bold text-foreground mb-2">아이디 · 비밀번호 찾기</h2>
            <p className="text-sm text-muted-foreground mb-5">
                가입 시 등록한 정보로 계정을 찾을 수 있습니다.
            </p>
            <FindSubTabs />

            {submitted ? (
                <div className="text-center py-6 px-4">
                    <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={28} className="text-primary" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">비밀번호 재설정 이메일 발송</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        <strong className="text-foreground">{email || "입력하신 이메일"}</strong>로<br />
                        비밀번호 재설정 링크를 발송했습니다.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700 mb-4">
                        이메일이 도착하지 않으면 스팸 폴더를 확인하거나 재발송을 요청하세요. (유효시간: 30분)
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => { setSubmitted(false); setEmail(""); setPhone(""); }}
                            className="border border-border text-muted-foreground hover:border-primary hover:text-primary px-4 py-2 rounded text-sm font-medium transition-colors"
                        >
                            다시 찾기
                        </button>
                        <Link
                            to="/auth/login"
                            className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                        >
                            로그인하기
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">가입 이메일 (아이디)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@company.com"
                            className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">휴대폰 번호</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="010-0000-0000"
                            className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
                        입력하신 이메일로 비밀번호 재설정 링크가 발송됩니다.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSubmitted(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        재설정 링크 발송 <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </>
    );
}