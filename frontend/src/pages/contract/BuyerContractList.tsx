import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileSearch,
  FileText,
  LoaderCircle,
  Search,
} from "lucide-react";
import api from "@/api/axios";

type ContractStatus =
  | "DRAFT"
  | "SELLER_SIGNED"
  | "BUYER_SIGNED"
  | "COMPLETED"
  | "CANCELED"
  | "EXPIRED";

type BuyerContract = {
  contractId: number;
  contractNo: string;
  contractName: string | null;
  quoteNo: string;
  productName: string;
  sellerCompanyName: string;
  contractAmount: number;
  status: ContractStatus;
  createdAt: string;
  completedAt: string | null;
  pdfUrl: string | null;
};

const statusDisplay: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "작성 중",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
  SELLER_SIGNED: {
    label: "서명 필요",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  BUYER_SIGNED: {
    label: "체결 처리 중",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  COMPLETED: {
    label: "계약 체결",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELED: {
    label: "계약 취소",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  EXPIRED: {
    label: "기간 만료",
    className: "border-slate-200 bg-slate-100 text-slate-500",
  },
};

function formatPrice(value: number) {
  return `${value.toLocaleString("ko-KR")}원`;
}

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function BuyerContractList() {
  const [contracts, setContracts] = useState<BuyerContract[]>([]);
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const loadContracts = async () => {
      try {
        setLoadError("");
        const response = await api.get<BuyerContract[]>("/buyer/contracts");
        setContracts(response);
      } catch (error) {
        console.error("바이어 계약 목록 조회 실패", error);
        setLoadError("계약 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadContracts();
  }, []);

  const visibleContracts = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return contracts;

    return contracts.filter((contract) =>
      [
        contract.contractNo,
        contract.contractName,
        contract.quoteNo,
        contract.productName,
        contract.sellerCompanyName,
      ].some((value) => value?.toLowerCase().includes(normalizedKeyword)),
    );
  }, [contracts, keyword]);

  return (
    <div className="min-h-screen bg-[#f7f9fb] px-4 py-8 sm:px-6">
      <main className="mx-auto w-full max-w-[1240px]">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black text-blue-600">CONTRACTS</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">
              계약 관리
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              수신한 계약서를 확인하고 서명과 결제를 이어서 진행합니다.
            </p>
          </div>
          <label className="relative block w-full sm:w-72">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="계약번호, 상품명 검색"
              className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
        </header>

        {isLoading ? (
          <div className="flex min-h-80 items-center justify-center">
            <LoaderCircle size={28} className="animate-spin text-blue-600" />
          </div>
        ) : loadError ? (
          <div className="py-20 text-center">
            <AlertCircle size={36} className="mx-auto text-rose-500" />
            <p className="mt-3 text-sm font-bold text-slate-700">{loadError}</p>
          </div>
        ) : visibleContracts.length === 0 ? (
          <div className="py-20 text-center">
            <FileText size={38} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              표시할 계약서가 없습니다.
            </p>
          </div>
        ) : (
          <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">계약 정보</th>
                    <th className="px-4 py-3">공급사</th>
                    <th className="px-4 py-3 text-right">계약 금액</th>
                    <th className="px-4 py-3">상태</th>
                    <th className="px-4 py-3">체결일</th>
                    <th className="px-5 py-3 text-right">작업</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleContracts.map((contract) => {
                    const display = statusDisplay[contract.status];

                    return (
                      <tr key={contract.contractId} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <Link
                            to={`/buyer/contracts/${contract.contractId}/sign`}
                            className="font-mono text-sm font-black text-slate-950 hover:text-blue-600"
                          >
                            {contract.contractNo}
                          </Link>
                          <p className="mt-1 max-w-xs truncate text-xs font-semibold text-slate-600">
                            {contract.contractName || contract.productName}
                          </p>
                          <p className="mt-1 text-[11px] text-slate-400">
                            연동 견적 {contract.quoteNo}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-slate-700">
                          {contract.sellerCompanyName}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-black text-slate-950">
                          {formatPrice(contract.contractAmount)}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-bold ${display.className}`}
                          >
                            {contract.status === "COMPLETED" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <Clock3 size={12} />
                            )}
                            {display.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {formatDate(contract.completedAt)}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {contract.pdfUrl && (
                              <a
                                href={contract.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="계약서 PDF"
                                className="inline-flex size-9 items-center justify-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50"
                              >
                                <FileSearch size={15} />
                              </a>
                            )}
                            {contract.status === "SELLER_SIGNED" && (
                              <Link
                                to={`/buyer/contracts/${contract.contractId}/sign`}
                                className="inline-flex h-9 items-center rounded-md bg-blue-600 px-3 text-xs font-bold text-white hover:bg-blue-700"
                              >
                                확인 및 서명
                              </Link>
                            )}
                            {contract.status === "COMPLETED" && (
                              <Link
                                to={`/checkout?contractId=${contract.contractId}`}
                                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-xs font-bold text-white hover:bg-slate-800"
                              >
                                <CreditCard size={14} />
                                결제하기
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
