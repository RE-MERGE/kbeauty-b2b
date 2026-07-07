import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { Link, useParams } from "react-router";
import {
  AlertCircle,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileSignature,
  Package,
  PenLine,
  Send,
  Truck,
  X,
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
  optionSummary: string;
  material: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

type SellerContractDetail = {
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
  material: string;
  deliveryCompany: string;
  shippingFee: number;
  leadTimeDays: number;
  validUntil: string;
  contractAmount: number;
  createdAt: string;
  sellerSignedAt: string | null;
  items: ContractItem[];
};

const statusConfig: Record<
  ContractStatus,
  { label: string; className: string }
> = {
  DRAFT: {
    label: "셀러 작성 대기",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  SELLER_SIGNED: {
    label: "바이어 서명 대기",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
  BUYER_SIGNED: {
    label: "계약 확정 처리 중",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  COMPLETED: {
    label: "계약 완료",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CANCELED: {
    label: "계약 취소",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  EXPIRED: {
    label: "기간 만료",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function formatPrice(value: number) {
  return `${value.toLocaleString()}원`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function SignatureCanvas({
  value,
  onChange,
}: {
  value: string;
  onChange: (dataUrl: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    context.strokeStyle = "#0f172a";
    context.lineWidth = 2.5;
    context.lineCap = "round";
    context.lineJoin = "round";
  }, []);

  const getPosition = (
    event: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in event) {
      return {
        x: (event.touches[0].clientX - rect.left) * scaleX,
        y: (event.touches[0].clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (
    event: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const position = getPosition(event);
    isDrawing.current = true;
    context.beginPath();
    context.moveTo(position.x, position.y);
  };

  const draw = (
    event: ReactMouseEvent<HTMLCanvasElement> | ReactTouchEvent<HTMLCanvasElement>
  ) => {
    event.preventDefault();
    if (!isDrawing.current) return;

    const context = canvasRef.current?.getContext("2d");
    if (!context) return;

    const position = getPosition(event);
    context.lineTo(position.x, position.y);
    context.stroke();
  };

  const finishDrawing = () => {
    if (!isDrawing.current) return;

    isDrawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas
      .getContext("2d")
      ?.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-600">손서명</label>
        {value && (
          <button
            type="button"
            onClick={clearSignature}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-rose-600"
          >
            <X size={13} />
            다시 서명
          </button>
        )}
      </div>
      <div
        className={`relative mt-1.5 overflow-hidden border-2 bg-white ${
          value ? "border-blue-500" : "border-dashed border-slate-200"
        }`}
      >
        <canvas
          ref={canvasRef}
          width={640}
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
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-300">
            마우스나 손가락으로 서명해 주세요.
          </p>
        )}
      </div>
    </div>
  );
}

export function SellerContractSign() {
  const { quoteId } = useParams<{ quoteId: string }>();
  const [contract, setContract] = useState<SellerContractDetail>();
  const [signatureText, setSignatureText] = useState("");
  const [signatureImage, setSignatureImage] = useState("");
  const [agreements, setAgreements] = useState({
    items: false,
    delivery: false,
    final: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!quoteId) {
      setLoadError("견적 정보를 확인할 수 없습니다.");
      setIsLoading(false);
      return;
    }

    const loadContract = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const response =
          await api.get<SellerContractDetail>(
            `/seller/contracts/quotes/${quoteId}`
          );
        setContract(response);
      } catch (error) {
        console.error("셀러 계약서 조회 실패", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "계약서를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadContract();
  }, [quoteId]);

  const totalQuantity = useMemo(
    () =>
      contract?.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      ) ?? 0,
    [contract]
  );

  const productAmount = useMemo(
    () =>
      contract?.items.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      ) ?? 0,
    [contract]
  );

  const allAgreed =
    agreements.items &&
    agreements.delivery &&
    agreements.final;

  const canSubmit =
    contract?.status === "DRAFT" &&
    signatureText.trim().length > 0 &&
    signatureImage.length > 0 &&
    allAgreed &&
    !isSubmitting;

  const uploadSignature = async () => {
    const response = await fetch(signatureImage);
    const blob = await response.blob();
    const file = new File(
      [blob],
      `contract-signature-${contract?.contractId}.png`,
      { type: "image/png" }
    );
    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", "contract-signatures");

    return api.post<string>("/common/image/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  const handleSignAndSend = async () => {
    if (!contract || !canSubmit) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      const signatureImageUrl = await uploadSignature();

      await api.post(
        `/seller/contracts/${contract.contractId}/sign`,
        {
          signatureText: signatureText.trim(),
          signatureImageUrl,
        }
      );

      setContract({
        ...contract,
        status: "SELLER_SIGNED",
        sellerSignedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("셀러 계약서 전송 실패", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "계약서를 전송하지 못했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[520px] items-center justify-center text-sm font-semibold text-slate-500">
        계약서를 불러오는 중입니다.
      </div>
    );
  }

  if (!contract || loadError) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-20 text-center">
        <FileSignature
          size={44}
          className="mx-auto text-slate-300"
        />
        <h1 className="mt-4 text-xl font-black text-slate-900">
          계약서를 불러올 수 없습니다.
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {loadError || "채택된 견적을 다시 확인해 주세요."}
        </p>
        <Link
          to="/seller/quotes"
          className="mt-6 inline-flex h-10 items-center rounded-md bg-blue-600 px-5 text-sm font-bold text-white hover:bg-blue-700"
        >
          견적 목록으로
        </Link>
      </div>
    );
  }

  const status = statusConfig[contract.status];
  const isDraft = contract.status === "DRAFT";

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto w-full max-w-[1120px] px-4 py-7 sm:px-6">
        <Link
          to="/seller/quotes"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-700"
        >
          <ChevronLeft size={15} />
          견적 목록으로
        </Link>

        <header className="mb-5 border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-blue-700">
                  공급 계약서
                </p>
                <span
                  className={`border px-2 py-1 text-xs font-bold ${status.className}`}
                >
                  {status.label}
                </span>
              </div>
              <h1 className="mt-2 text-2xl font-black text-slate-950">
                {contract.contractName || contract.productName}
              </h1>
              <p className="mt-1 font-mono text-xs font-semibold text-slate-500">
                {contract.contractNo}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                채택된 견적 내용을 확인하고 서명해 바이어에게
                전달합니다.
              </p>
            </div>
            <div className="text-left md:text-right">
              <p className="text-xs font-semibold text-slate-400">
                계약 금액
              </p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {formatPrice(contract.contractAmount)}
              </p>
              <p className="mt-1 font-mono text-xs text-slate-400">
                {contract.quoteNo}
              </p>
            </div>
          </div>
        </header>

        {!isDraft && (
          <div className="mb-5 flex items-start gap-3 border border-blue-200 bg-blue-50 px-4 py-4 text-sm text-blue-800">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">
                계약서를 바이어에게 전달했습니다.
              </p>
              <p className="mt-1 text-xs leading-5 text-blue-700">
                바이어 서명이 완료되면 계약이 확정되고 결제 단계로
                진행됩니다.
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="space-y-5">
            <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <Building2 size={16} className="text-blue-700" />
                <h2 className="text-sm font-black text-slate-900">
                  계약 당사자
                </h2>
              </div>
              <div className="grid sm:grid-cols-2">
                <div className="border-b border-slate-100 px-5 py-4 sm:border-b-0 sm:border-r">
                  <p className="text-xs font-bold text-slate-400">
                    발주자
                  </p>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    {contract.buyerCompanyName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {contract.buyerBusinessNumber}
                  </p>
                </div>
                <div className="px-5 py-4">
                  <p className="text-xs font-bold text-slate-400">
                    공급자
                  </p>
                  <p className="mt-2 text-sm font-black text-slate-900">
                    {contract.sellerCompanyName}
                  </p>
                  <p className="mt-1 font-mono text-xs text-slate-500">
                    {contract.sellerBusinessNumber}
                  </p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <Package size={16} className="text-blue-700" />
                <h2 className="text-sm font-black text-slate-900">
                  계약 품목
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500">
                    <tr>
                      <th className="px-5 py-3">상품·옵션</th>
                      <th className="px-4 py-3 text-right">수량</th>
                      <th className="px-4 py-3 text-right">단가</th>
                      <th className="px-5 py-3 text-right">금액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contract.items.map((item) => (
                      <tr key={item.contractItemId}>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-slate-900">
                            {item.productName}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.optionSummary || "기본 옵션"}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                          {item.quantity.toLocaleString()}개
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-slate-600">
                          {formatPrice(item.unitPrice)}
                        </td>
                        <td className="px-5 py-4 text-right text-sm font-black text-slate-900">
                          {formatPrice(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
                <Truck size={16} className="text-blue-700" />
                <h2 className="text-sm font-black text-slate-900">
                  납기 및 배송 조건
                </h2>
              </div>
              <div className="grid gap-4 px-5 py-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    제작 소요일
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {contract.leadTimeDays}일
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    배송 방식
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {contract.deliveryCompany || "협의 배송"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400">
                    견적 유효기간
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-900">
                    {formatDate(contract.validUntil)}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <section className="border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <FileSignature size={17} className="text-blue-700" />
                <h2 className="text-sm font-black text-slate-900">
                  계약 요약
                </h2>
              </div>

              <dl className="mt-4 space-y-3 border-b border-slate-100 pb-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">총 수량</dt>
                  <dd className="font-bold text-slate-900">
                    {totalQuantity.toLocaleString()}개
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">상품 금액</dt>
                  <dd className="font-bold text-slate-900">
                    {formatPrice(productAmount)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-slate-500">배송비</dt>
                  <dd className="font-bold text-slate-900">
                    {formatPrice(contract.shippingFee)}
                  </dd>
                </div>
              </dl>

              <div className="flex items-end justify-between py-4">
                <span className="text-sm font-bold text-slate-600">
                  계약 총액
                </span>
                <span className="text-xl font-black text-blue-700">
                  {formatPrice(contract.contractAmount)}
                </span>
              </div>

              {isDraft ? (
                <>
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    {[
                      {
                        key: "items" as const,
                        label: "계약 품목과 금액을 확인했습니다.",
                      },
                      {
                        key: "delivery" as const,
                        label: "납기 및 배송 조건을 확인했습니다.",
                      },
                      {
                        key: "final" as const,
                        label: "위 내용으로 계약서를 전송합니다.",
                      },
                    ].map((agreement) => (
                      <label
                        key={agreement.key}
                        className="flex cursor-pointer items-start gap-2.5 text-xs font-semibold leading-5 text-slate-600"
                      >
                        <input
                          type="checkbox"
                          checked={agreements[agreement.key]}
                          onChange={(event) =>
                            setAgreements({
                              ...agreements,
                              [agreement.key]: event.target.checked,
                            })
                          }
                          className="mt-0.5 h-4 w-4 accent-blue-600"
                        />
                        {agreement.label}
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-bold text-slate-600">
                      서명자명
                    </label>
                    <div className="relative mt-1.5">
                      <PenLine
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        value={signatureText}
                        onChange={(event) =>
                          setSignatureText(event.target.value)
                        }
                        maxLength={100}
                        placeholder="대표자 또는 담당자명"
                        className="h-10 w-full rounded-md border border-slate-200 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>

                  <SignatureCanvas
                    value={signatureImage}
                    onChange={setSignatureImage}
                  />

                  {submitError && (
                    <div className="mt-3 flex gap-2 border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">
                      <AlertCircle size={14} className="shrink-0" />
                      {submitError}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!canSubmit}
                    onClick={handleSignAndSend}
                    className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-blue-600 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Send size={16} />
                    {isSubmitting
                      ? "전송 중..."
                      : "서명 후 바이어에게 전송"}
                  </button>
                </>
              ) : (
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                    <Check size={16} />
                    셀러 서명 완료
                  </div>
                  {contract.sellerSignedAt && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock3 size={13} />
                      {new Date(
                        contract.sellerSignedAt
                      ).toLocaleString("ko-KR")}
                    </p>
                  )}
                </div>
              )}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
