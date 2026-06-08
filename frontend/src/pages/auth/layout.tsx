import { Link, Outlet, useLocation } from "react-router";

// function TabLink({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
//     return (
//         <Link
//             to={to}
//             className={`flex-1 py-3 text-sm font-semibold transition-colors text-center ${
//                 active ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary"
//             }`}
//         >
//             {children}
//         </Link>
//     );
// }

export function AuthLayout() {
    const { pathname } = useLocation();

    return (
        <div className="max-w-[1280px] mx-auto px-4 py-12">
            <div className="max-w-[560px] mx-auto">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                        <div className="text-3xl font-bold">
                            <span className="text-primary">Style</span>
                            <span className="text-foreground">Hub</span>
                        </div>
                        <div className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">
                            국내 패션 B2B 도매 플랫폼
                        </div>
                    </Link>
                </div>

                {/* Top Tab Nav */}
                {/*<div className="flex border border-border rounded overflow-hidden mb-6">*/}

                    {/*<TabLink to="/auth/login" active={pathname === "/auth/login"}>*/}
                    {/*    로그인*/}
                    {/*</TabLink>*/}
                    {/*<TabLink to="/auth/register" active={pathname.startsWith("/auth/register")}>*/}
                    {/*    회원가입*/}
                    {/*</TabLink>*/}
                    {/*<TabLink to="/auth/find-id" active={pathname.startsWith("/auth/find")}>*/}
                    {/*    아이디·비밀번호 찾기*/}
                    {/*</TabLink>*/}
                {/*</div>*/}

                <div className="bg-white border border-border rounded p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}