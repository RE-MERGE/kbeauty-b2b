import * as PortOne from "@portone/browser-sdk/v2";

export const PhoneAuthButton = ({ onAuthSuccess }: { onAuthSuccess: (uid: string) => void }) => {
    const handleAuth = async () => {
        try {
            const response = await PortOne.requestIdentityVerification({
                storeId: "", // TODO
                channelKey: "", // TODO
                identityVerificationId: `auth-${crypto.randomUUID()}`,
            });

            if (response && response.code == null) {
                // 1. 에러가 나면 아래 console.log를 통해 구조를 확인하세요!
                console.log("포트원 응답 전체 확인:", response);

                // 2. TypeScript 에러를 잠시 피하려면 (any 타입 사용)
                const data = response as any;
                onAuthSuccess(data.impUid);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return <button
        type="button"
        onClick={handleAuth}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        휴대폰 본인 인증하기</button>;
};