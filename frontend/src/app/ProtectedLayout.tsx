import {Navigate, Outlet, useMatches} from "react-router";
import {useAuthStore} from "@/store/useAuthStore";
import {useEffect} from "react";
import {getMe} from "@/api/auth";

export function ProtectedLayout() {
    const {user, isLoading, setLoading, setUser, clearUser} = useAuthStore();
    const matches = useMatches();

    // 1. 동기식 스토리지 검사 (렌더링 차단용 흔적 확인)
    const storageStr = localStorage.getItem("auth-storage");
    let hasToken = false;

    if (storageStr) {
        try {
            const storageData = JSON.parse(storageStr);
            if (storageData?.state?.isAuthenticated) {
                hasToken = true;
            }
        } catch (e) {
            hasToken = false;
        }
    }

    // 2. 비동기 유저 검증 (Hook 규칙을 위해 조건문보다 항상 최상단에 위치)
    useEffect(() => {
        const initAuth = async () => {
            try {
                const me = await getMe();
                setUser(me);
            } catch (error) {
                // 흔적(hasToken)이 있었는데 백엔드 검증에 실패했다는 것은
                // 잘 쓰다가 토큰이 만료되었거나 쿠키를 강제로 지운 상황입니다.
                if (hasToken) {
                    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
                }
                clearUser();
            } finally {
                setLoading(false); // 🚨 무한 로딩 탈출 장치! 실패하든 성공하든 로딩은 끝내줍니다.
            }
        };

        if (hasToken) {
            void initAuth();
        } else {
            setLoading(false); // 흔적조차 없는 쌩 비로그인은 즉시 로딩 종료 (아래에서 말없이 튕김)
        }
    }, [hasToken, setUser, clearUser, setLoading]);

    // ─────────────────────────────────────────────────────────────
    // 3. 화면 흐름 제어 조건문 (순서 정석화)
    // ─────────────────────────────────────────────────────────────

    // 검증이 완료될 때까지는 안전하게 로딩 화면으로 묶어둡니다.
    if (isLoading) {
        return (
            <div
                className="h-screen w-screen flex items-center justify-center text-sm text-muted-foreground bg-white fixed inset-0 z-50">
                로딩 중...
            </div>
        );
    }

    // 로딩이 끝났는데 유저 정보가 없다면 (쌩 비로그인이거나 만료되어 튕긴 경우)
    if (!user) {
        return <Navigate to="/auth" replace/>;
    }

    // 권한 체크 (어드민 / 바이어 / 셀러)
    const requiredRole = matches
        .map((m) => (m.handle as any)?.role)
        .find(Boolean);

    if (requiredRole && user.businessRole !== requiredRole && user.role !== "ADMIN") {
        return <Navigate to="/" replace/>;
    }

    // 모든 관문을 통과하면 실제 페이지를 보여줍니다.
    return <Outlet/>;
}