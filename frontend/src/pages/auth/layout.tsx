import { Link, Outlet, useLocation } from "react-router";

export function AuthLayout() {
    const location = useLocation();
    // 로그인 페이지인지 확인
    const isLoginPage = location.pathname === "/auth/login";

    // 로그인 페이지면 750px, 그 외(가입, 아이디찾기 등)는 480px
    const maxWidth = isLoginPage ? "max-w-[750px]" : "max-w-[450px]";

    return (
        <div className="max-w-[1280px] mx-auto px-4 py-12">
            <div className={`${maxWidth} mx-auto transition-all`}>
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/auth/login" className="inline-block">
                        <div className="text-5xl font-bold">
                            <span className="text-primary">Style</span>
                            <span className="text-foreground">Hub</span>
                        </div>
                        <div className="text-xs text-muted-foreground tracking-widest uppercase mt-2">
                            국내 패션 B2B 도매 플랫폼
                        </div>
                    </Link>
                </div>
                <div className="bg-white border border-border rounded-xl p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}