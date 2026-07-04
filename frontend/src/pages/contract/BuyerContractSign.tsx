import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  LoaderCircle,
  Package,
  PenLine,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import api from "@/api/axios";

type ContractStatus =
  | "DRAFT"
  | "SELLER_SIGNED"
  | "BUYER_SIGNED"
  | "COMPLETED"
  | "CANCELED"
  | "EXPIRED";

type ContractItem = {
  contractItemId: number;
  productName: string;
  optionSummary: string | null;
  material: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type BuyerContractDetail = {
  contractId: number;
  contractNo: string;
  contractName: string | null;
  quoteId: number;
  quoteNo: string;
  status: ContractStatus;
  buyerCompanyName: string;
  buyerBusinessNumber: string;
  sellerCompanyName: string;
  sellerBusinessNumber: string;
  productName: string;
  material: string | null;
  deliveryCompany: string | null;
  shippingFee: number;
  leadTimeDays: number;
  validUntil: string;
  contractAmount: number;
  deliveryDate: string;
  paymentTerms: string;
  returnPolicy: string;
  specialTerms: string | null;
  createdAt: string;
  sellerSignedAt: string | null;
  buyerSignedAt: string | null;
  completedAt: string | null;
  items: ContractItem[];
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

function formatDateTime(value: string | null) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function SignatureCanvas({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.strokeStyle = "#172019";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  const getPosition = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const pointer = "touches" in event ? event.touches[0] : event;

    return {
      x: (pointer.clientX - rect.left) * (canvas.width / rect.width),
      y: (pointer.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const position = getPosition(event);
    isDrawing.current = true;
    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const draw = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    if (!isDrawing.current) return;

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const position = getPosition(event);
    context.lineTo(position.x, position.y);
    context.stroke();
  };

  const finishDrawing = () => {
    if (!isDrawing.current || !canvasRef.current) return;

    isDrawing.current = false;
    onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
          <PenLine size={15} className="text-primary" />
          손 서명
        </span>
        {value && (
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-rose-600"
          >
            <RotateCcw size={12} />
            다시 서명
          </button>
        )}
      </div>
      <div className="relative overflow-hidden rounded-lg border-2 border-dashed border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          width={720}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseLeave={finishDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={finishDrawing}
          className="h-32 w-full touch-none cursor-crosshair"
        />
        {!value && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400">
            이 영역에 서명해 주세요
          </p>
        )}
      </div>
    </div>
  );
}

export function BuyerContractSign() {
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<BuyerContractDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [agreements, setAgreements] = useState({
    specification: false,
    returnPolicy: false,
    final: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const parsedContractId = Number(contractId);

    if (!Number.isInteger(parsedContractId) || parsedContractId <= 0) {
      setLoadError("유효하지 않은 계약서입니다.");
      setIsLoading(false);
      return;
    }

    const loadContract = async () => {
      try {
        setLoadError("");
        const response = await api.get<BuyerContractDetail>(
          `/buyer/contracts/${parsedContractId}`,
        );
        setContract(response);
      } catch (error) {
        setLoadError(
          error instanceof Error
            ? error.message
            : "계약서를 불러오지 못했습니다.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadContract();
  }, [contractId]);

  const uploadSignature = async () => {
    const imageResponse = await fetch(signatureImage);
    const blob = await imageResponse.blob();
    const file = new File(
      [blob],
      `buyer-contract-signature-${contract?.contractId}.png`,
      { type: "image/png" },
    );
    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", "contract-signatures");

    return api.post<string>("/common/image/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  const canSign =
    contract?.status === "SELLER_SIGNED"
    && signatureText.trim().length > 0
    && signatureImage.length > 0
    && agreements.specification
    && agreements.returnPolicy
    && agreements.final
    && !isSubmitting;

  const handleSign = async () => {
    if (!contract || !canSign) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const signatureImageUrl = await uploadSignature();

      await api.post(`/buyer/contracts/${contract.contractId}/sign`, {
        signatureText: signatureText.trim(),
        signatureImageUrl,
      });

      const completedAt = new Date().toISOString();
      setContract({
        ...contract,
        status: "COMPLETED",
        buyerSignedAt: completedAt,
        completedAt,
      });
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "계약서 서명에 실패했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!contract || loadError) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <AlertCircle size={42} className="mx-auto mb-4 text-rose-500" />
        <h1 className="text-xl font-bold text-slate-950">계약서를 확인할 수 없습니다</h1>
        <p className="mt-2 text-sm text-slate-500">{loadError}</p>
        <Link
          to="/buyer/quotes"
          className="mt-6 inline-flex rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          견적 목록으로
        </Link>
      </div>
    );
  }

  const totalQuantity = contract.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const isCompleted = contract.status === "COMPLETED";
  const canDisplaySignForm = contract.status === "SELLER_SIGNED";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              to="/buyer/quotes"
              title="견적 목록으로 돌아가기"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft size={19} />
            </Link>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-400">
                상품 공급계약서 · {contract.contractNo}
              </p>
              <h1 className="mt-1 truncate text-xl font-black text-slate-950">
                {contract.contractName || `${contract.productName} 공급 계약`}
              </h1>
              <p className="mt-1 text-xs font-semibold text-slate-500">
                연동 견적 {contract.quoteNo}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex h-9 w-fit items-center gap-2 rounded-full border px-3 text-xs font-black ${
              isCompleted
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-blue-200 bg-blue-50 text-blue-700"
            }`}
          >
            {isCompleted ? <CheckCircle size={15} /> : <ShieldCheck size={15} />}
            {isCompleted ? "계약 체결 완료" : "바이어 서명 대기"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-[1380px] items-start gap-6 px-4 py-7 sm:px-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <section className="grid gap-4 sm:grid-cols-2">
            <PartyInfo
              label="발주자 (Buyer)"
              companyName={contract.buyerCompanyName}
              businessNumber={contract.buyerBusinessNumber}
            />
            <PartyInfo
              label="공급자 (Seller)"
              companyName={contract.sellerCompanyName}
              businessNumber={contract.sellerBusinessNumber}
            />
          </section>

          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <Package size={17} className="text-slate-500" />
                <h2 className="text-sm font-black text-slate-900">
                  계약 품목
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">
                총 {contract.items.length}건 ·{" "}
                {totalQuantity.toLocaleString("ko-KR")}개
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="border-b border-slate-200 text-xs font-bold text-slate-500">
                  <tr>
                    <th className="px-5 py-3">품목명 / 상세 옵션</th>
                    <th className="px-4 py-3 text-right">수량</th>
                    <th className="px-4 py-3 text-right">단가</th>
                    <th className="px-5 py-3 text-right">합계</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contract.items.map((item) => (
                    <tr
                      key={item.contractItemId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-black text-slate-900">
                          {item.productName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {[item.optionSummary, item.material]
                            .filter(Boolean)
                            .join(" · ") || "옵션 정보 없음"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                        {item.quantity.toLocaleString("ko-KR")}개
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                        {formatPrice(item.unitPrice)}
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-black text-slate-950">
                        {formatPrice(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Truck size={17} className="text-slate-500" />
              <h2 className="text-sm font-black text-slate-900">
                핵심 계약 조건
              </h2>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoBox
                icon={<Calendar size={14} />}
                label="납품 예정일"
                value={formatDate(contract.deliveryDate)}
              />
              <InfoBox
                icon={<Clock size={14} />}
                label="리드타임"
                value={`${contract.leadTimeDays}일`}
              />
              <InfoBox
                label="배송 조건"
                value={`${contract.deliveryCompany || "협의 배송"} · ${
                  contract.shippingFee === 0
                    ? "무료 배송"
                    : `배송비 ${formatPrice(contract.shippingFee)}`
                }`}
              />
              <InfoBox label="결제 조건" value={contract.paymentTerms} />
            </div>

            <TermsBlock
              label="반품·교환 조건"
              value={contract.returnPolicy}
            />
            {contract.specialTerms && (
              <TermsBlock label="특약사항" value={contract.specialTerms} />
            )}
          </section>

          <section className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-black text-blue-900">
                셀러 전자서명 확인
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-700">
                {contract.sellerCompanyName}에서{" "}
                {formatDateTime(contract.sellerSignedAt)}에 서명하여 전달한
                계약서입니다.
              </p>
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:col-span-4">
          <section className="overflow-hidden rounded-lg bg-slate-950 text-white shadow-lg">
            <div className="border-b border-white/10 px-5 py-5">
              <p className="text-xs font-bold text-slate-400">총 계약 금액</p>
              <p className="mt-2 text-3xl font-black">
                {formatPrice(contract.contractAmount)}
              </p>
            </div>
            <dl className="space-y-3 px-5 py-4 text-sm">
              <SummaryRow
                label="상품 금액"
                value={formatPrice(
                  contract.contractAmount - contract.shippingFee,
                )}
                dark
              />
              <SummaryRow
                label="배송비"
                value={
                  contract.shippingFee === 0
                    ? "무료"
                    : formatPrice(contract.shippingFee)
                }
                dark
              />
              <SummaryRow
                label="계약 품목"
                value={`${contract.items.length}건 · ${totalQuantity.toLocaleString("ko-KR")}개`}
                dark
              />
            </dl>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            {canDisplaySignForm ? (
              <>
                <h2 className="text-sm font-black text-slate-950">
                  계약 검토 및 전자서명
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  모든 계약 내용을 확인한 뒤 동의와 서명을 완료해 주세요.
                </p>

                <div className="mt-5 space-y-4">
                  <Agreement
                    checked={agreements.specification}
                    onChange={(checked) =>
                      setAgreements((current) => ({
                        ...current,
                        specification: checked,
                      }))
                    }
                    label="계약 상품의 옵션, 수량과 단가를 확인했습니다."
                  />
                  <Agreement
                    checked={agreements.returnPolicy}
                    onChange={(checked) =>
                      setAgreements((current) => ({
                        ...current,
                        returnPolicy: checked,
                      }))
                    }
                    label="납품, 결제 및 반품·교환 조건을 확인했습니다."
                  />
                  <Agreement
                    checked={agreements.final}
                    onChange={(checked) =>
                      setAgreements((current) => ({
                        ...current,
                        final: checked,
                      }))
                    }
                    label="계약 내용에 동의하며 전자서명을 진행합니다."
                  />
                </div>

                <label className="mt-6 block">
                  <span className="text-xs font-black text-slate-600">
                    서명자명
                  </span>
                  <input
                    value={signatureText}
                    onChange={(event) =>
                      setSignatureText(event.target.value)
                    }
                    maxLength={100}
                    placeholder="서명자명을 입력하세요"
                    className="mt-2 h-10 w-full rounded-md border border-slate-200 px-3 text-sm font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                <div className="mt-5">
                  <SignatureCanvas
                    value={signatureImage}
                    onChange={setSignatureImage}
                  />
                </div>

                {submitError && (
                  <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-semibold text-rose-700">
                    {submitError}
                  </p>
                )}

                <button
                  type="button"
                  disabled={!canSign}
                  onClick={handleSign}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                >
                  {isSubmitting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}
                  {isSubmitting ? "서명 처리 중..." : "계약서 서명 완료"}
                </button>

                <p className="mt-3 text-center text-[11px] leading-5 text-slate-400">
                  서명 완료 후 계약 내용과 서명 정보가 최종 PDF로
                  보관됩니다.
                </p>
              </>
            ) : isCompleted ? (
              <div className="py-2 text-center">
                <span className="mx-auto inline-flex size-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle size={23} />
                </span>
                <h2 className="mt-3 text-base font-black text-slate-950">
                  계약 체결이 완료되었습니다
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  바이어 서명 {formatDateTime(contract.buyerSignedAt)}
                </p>
              </div>
            ) : (
              <div className="py-2 text-center">
                <AlertCircle
                  size={28}
                  className="mx-auto text-amber-500"
                />
                <h2 className="mt-3 text-sm font-black text-slate-950">
                  현재 서명할 수 없는 계약서입니다
                </h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  계약 상태를 확인한 뒤 다시 시도해 주세요.
                </p>
              </div>
            )}
          </section>

          <p className="px-3 text-center text-[11px] leading-5 text-slate-400">
            계약 유효기간 {formatDate(contract.validUntil)}
          </p>
        </aside>
      </main>
    </div>
  );
}

function PartyInfo({
  label,
  companyName,
  businessNumber,
}: {
  label: string;
  companyName: string;
  businessNumber: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black text-blue-700">
        <ShieldCheck size={16} />
        {label}
      </div>
      <p className="mt-4 text-lg font-black text-slate-950">{companyName}</p>
      <p className="mt-1 text-xs text-slate-500">
        사업자등록번호 {businessNumber || "-"}
      </p>
    </div>
  );
}

function InfoBox({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TermsBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-3 rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{value}</p>
    </div>
  );
}

function Agreement({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4"
      />
      <span>{label}</span>
    </label>
  );
}

function SummaryRow({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={dark ? "text-slate-400" : "text-slate-500"}>
        {label}
      </dt>
      <dd className={dark ? "font-bold text-white" : "font-bold text-slate-900"}>
        {value}
      </dd>
    </div>
  );
}
