import { Link } from "react-router";
import { User, Building2 } from "lucide-react";

export default function Register() {
    return (
        <div>
            <h2 className="text-xl font-bold text-foreground mb-2">회원가입</h2>
            <p className="text-sm text-muted-foreground mb-6">
                가입 후 담당자 확인을 거쳐 계정이 활성화됩니다.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <Link
                    to="/auth/register/buyer"
                    className="border-2 border-border hover:border-primary rounded p-6 text-left transition-all group"
                >
                    <User size={24} className="mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        바이어
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">의류를 도매로 구매하는 소매 사업자</div>
                </Link>
                <Link
                    to="/auth/register/seller"
                    className="border-2 border-border hover:border-primary rounded p-6 text-left transition-all group"
                >
                    <Building2 size={24} className="mb-3 text-muted-foreground group-hover:text-primary transition-colors" />
                    <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        셀러 (공급업체)
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">의류를 도매로 공급하는 셀러·브랜드</div>
                </Link>
            </div>
            <div className="mt-6 text-center text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <Link to="/auth/login" className="text-primary font-semibold hover:underline">
                    로그인
                </Link>
            </div>
        </div>
    );
}