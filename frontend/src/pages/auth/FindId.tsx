import { useState } from "react";
import { Link } from "react-router";
import { Mail, KeyRound, ArrowRight, CheckCircle } from "lucide-react";

function FindSubTabs() {
    return (
        <div className="flex border border-border rounded overflow-hidden mb-6">
      <span className="flex-1 py-2.5 text-sm font-semibold text-center bg-secondary text-primary border-b-2 border-primary">
        <Mail size={14} className="inline mr-1.5" />아이디 찾기
      </span>
            <Link
                to="/auth/find-pw"
                className="flex-1 py-2.5 text-sm font-semibold transition-colors text-center bg-white text-muted-foreground hover:text-primary"
            >
                <KeyRound size={14} className="inline mr-1.5" />비밀번호 찾기
            </Link>
        </div>
    );
}

export function FindId() {
    const [name, setName] = useState("");
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
                    <h3 className="font-bold text-foreground mb-2">아이디 조회 결과</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        입력하신 정보와 일치하는 계정을 찾았습니다.
                    </p>
                    <div className="bg-secondary border border-primary/20 rounded p-4 mb-4 text-left">
                        <div className="text-xs text-muted-foreground mb-1">등록된 이메일 (아이디)</div>
                        <div className="font-mono font-semibold text-foreground">fa***ion@example.com</div>
                        <div className="text-xs text-muted-foreground mt-2">가입일: 2025.03.15</div>
                    </div>
                    <div className="flex gap-2 justify-center">
                        <button
                            type="button"
                            onClick={() => { setSubmitted(false); setName(""); setPhone(""); }}
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
                        <label className="block text-sm font-medium text-[#333] mb-1.5">담당자명</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="가입 시 등록한 이름"
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
                        입력하신 정보로 등록된 이메일 주소 일부를 마스킹하여 보여드립니다.
                    </p>
                    <button
                        type="button"
                        onClick={() => setSubmitted(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                    >
                        아이디 찾기 <ArrowRight size={16} />
                    </button>
                </div>
            )}
        </>
    );
}