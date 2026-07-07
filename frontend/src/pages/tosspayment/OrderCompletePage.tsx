import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import api from '@/api/axios';
import { Loader2, Package } from 'lucide-react';

type OrderCompleteLocationState = {
    orderNumbers?: string[];
};

// GET /buyer/orders 목록 응답 중 요약 표시에 필요한 필드만 사용한다.
type BuyerOrderListItem = {
    orderId: number;
    orderNo: string;
    totalAmount: number;
    representativeProductName: string;
    itemCount: number;
    totalQuantity: number;
};

function formatPrice(value: number) {
    return `${value.toLocaleString()}원`;
}

export default function OrderCompletePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const orderNumbers =
        (location.state as OrderCompleteLocationState | null)?.orderNumbers ?? [];

    const [orders, setOrders] = useState<BuyerOrderListItem[]>([]);
    const [isLoadingSummary, setIsLoadingSummary] = useState(orderNumbers.length > 0);

    useEffect(() => {
        if (orderNumbers.length === 0) return;

        let cancelled = false;

        api.get<BuyerOrderListItem[]>('/buyer/orders')
            .then((allOrders) => {
                if (cancelled) return;
                const matched = allOrders.filter((order) =>
                    orderNumbers.includes(order.orderNo),
                );
                setOrders(matched);
            })
            .catch((error) => {
                console.error('주문 요약 조회 실패', error);
            })
            .finally(() => {
                if (!cancelled) setIsLoadingSummary(false);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const totalPaid = orders.reduce((sum, order) => sum + order.totalAmount, 0);

    return (
        <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-10">

                {/* 성공 체크 마크 아이콘 */}
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <svg
                        className="h-10 w-10 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                </div>

                {/* 메인 메시지 */}
                <h1 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">
                    주문 및 결제 완료!
                </h1>
                <p className="mt