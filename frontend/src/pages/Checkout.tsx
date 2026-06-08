import { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Package,
  MapPin,
  CreditCard,
  FileText,
  ArrowLeft,
  CheckCircle,
  X,
  ShoppingBag,
} from "lucide-react";

const orderItems = [
  {
    id: 1,
    name: "여성 베이직 오버핏 셔츠",
    supplier: "라온어패럴",
    price: 18900,
    quantity: 50,
    image:
      "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=80&h=80&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "여성 와이드 슬랙스",
    supplier: "모던클로젯",
    price: 24500,
    quantity: 30,
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=80&h=80&fit=crop&auto=format",
  },
];

export function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState("escrow");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const navigate = useNavigate();

  const subtotal = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = subtotal >= 1000000 ? 0 : 3000;

  const platformFeeRate = 0.05;
  const platformFee = Math.floor(subtotal * platformFeeRate);

  const total = subtotal + shipping + platformFee;

  const formatPrice = (price: number) => `${price.toLocaleString()}원`;

  const handlePayment = () => {
    if (!agreeTerms) return;

    const newOrderNumber = `ORD-${new Date().getFullYear()}-${String(
      Math.floor(Math.random() * 9000) + 1000
    )}`;

    setOrderNumber(newOrderNumber);
    setShowSuccessModal(true);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <Link
        to="/cart"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        장바구니로 돌아가기
      </Link>

      <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
        <Package size={24} className="text-primary" />
        주문/결제
      </h1>

      <div className="grid grid-cols-[1fr_380px] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary" />
              배송지 정보
            </h2>

            <div className="space-y-4">
              <div className="border border-border rounded p-4 bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">
                    회사 기본 배송지
                  </span>
                  <button className="text-xs text-primary hover:underline">
                    변경
                  </button>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span className="font-medium text-foreground">홍길동</span>
                    <span>010-1234-5678</span>
                  </div>
                  <div>서울특별시 강남구 테헤란로 123</div>
                  <div className="text-xs">A동 5층</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  배송 요청사항
                </label>
                <textarea
                  placeholder="배송 시 요청사항을 입력하세요"
                  rows={3}
                  className="w-full border border-border rounded px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-primary" />
              결제 방법
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 border border-border rounded p-4 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="escrow"
                  checked={paymentMethod === "escrow"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    에스크로 안전결제
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    결제 대금을 보호하고 거래 완료 후 판매자에게 정산합니다
                  </div>
                </div>
                <span className="text-xs bg-primary text-white px-2 py-0.5 rounded font-semibold">
                  안전
                </span>
              </label>

              <label className="flex items-center gap-3 border border-border rounded p-4 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="wire"
                  checked={paymentMethod === "wire"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    무통장 입금
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    입금 확인 후 주문이 진행됩니다
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 border border-border rounded p-4 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <div className="flex-1">
                  <div className="font-semibold text-foreground">
                    법인카드 결제
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    법인카드로 즉시 결제합니다
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText size={18} className="text-primary" />
              주문 동의
            </h2>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5"
              />
              <div className="text-sm text-foreground">
                <span className="font-semibold">
                  주문 내용을 확인하였으며, 이용약관 및 개인정보 처리방침에
                  동의합니다.
                </span>
                <div className="text-xs text-muted-foreground mt-1">
                  상품 금액, 배송비, 플랫폼 이용 수수료를 확인하였으며 구매에
                  동의합니다.
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-border rounded-lg p-6 sticky top-4">
            <h2 className="font-bold text-foreground mb-5">주문 상품</h2>

            <div className="space-y-3 mb-5 max-h-[300px] overflow-y-auto">
              {orderItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 pb-3 border-b border-border last:border-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground line-clamp-2 leading-snug">
                      {item.name}
                    </h4>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {item.supplier}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground font-mono">
                        {item.quantity.toLocaleString()}장
                      </span>
                      <span className="text-sm font-bold font-mono text-foreground">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm border-t border-border pt-5">
              <div className="flex justify-between text-muted-foreground">
                <span>상품 금액</span>
                <span className="font-mono">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>국내 배송비</span>
                <span className="font-mono">
                  {shipping === 0 ? "무료배송" : formatPrice(shipping)}
                </span>
              </div>

              <div className="flex justify-between text-muted-foreground">
                <span>플랫폼 이용 수수료</span>
                <span className="font-mono">{formatPrice(platformFee)}</span>
              </div>

              <div className="text-xs text-muted-foreground bg-secondary rounded p-2 leading-relaxed">
                플랫폼 이용 수수료는 안전결제, 주문 관리, 판매자 정산 처리에
                사용됩니다.
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                <span>최종 결제 금액</span>
                <span className="font-mono text-primary text-lg">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <button
              disabled={!agreeTerms}
              onClick={handlePayment}
              className={`mt-6 w-full py-3.5 rounded font-semibold text-sm transition-colors ${
                agreeTerms
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {agreeTerms
                ? `${formatPrice(total)} 결제하기`
                : "약관에 동의해주세요"}
            </button>

            <div className="mt-4 bg-secondary border border-primary/20 rounded p-3 text-xs text-muted-foreground leading-relaxed">
              <div className="font-semibold text-foreground mb-1 flex items-center gap-1">
                <CheckCircle size={12} className="text-primary" />
                안전결제 보장
              </div>
              결제 대금은 안전하게 보호되며, 거래 완료 확인 후 판매자에게
              정산됩니다.
            </div>
          </div>
        </div>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle size={48} className="text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center text-foreground mb-2">
              결제가 완료되었습니다!
            </h2>

            <p className="text-center text-muted-foreground text-sm mb-6">
              주문이 성공적으로 접수되었습니다
            </p>

            <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-5 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">주문번호</span>
                  <span className="font-mono font-bold text-primary">
                    {orderNumber}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">결제 방법</span>
                  <span className="font-medium text-foreground">
                    {paymentMethod === "escrow"
                      ? "에스크로 안전결제"
                      : paymentMethod === "wire"
                      ? "무통장 입금"
                      : "법인카드 결제"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">상품 수량</span>
                  <span className="font-medium text-foreground">
                    {orderItems.length}개 품목
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">플랫폼 수수료</span>
                  <span className="font-mono text-foreground">
                    {formatPrice(platformFee)}
                  </span>
                </div>

                <div className="border-t border-pink-200 pt-3 flex justify-between">
                  <span className="font-semibold text-foreground">
                    최종 결제 금액
                  </span>
                  <span className="font-mono font-bold text-primary text-lg">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Package
                  size={16}
                  className="text-blue-600 mt-0.5 flex-shrink-0"
                />

                <div className="text-xs text-blue-800 leading-relaxed">
                  {paymentMethod === "escrow" ? (
                    <>
                      <strong>에스크로 안전결제가 적용되었습니다.</strong>
                      <br />
                      결제 대금이 보호되며, 거래 완료 후 판매자에게 정산됩니다.
                    </>
                  ) : paymentMethod === "wire" ? (
                    <>
                      <strong>입금 안내가 이메일로 발송되었습니다.</strong>
                      <br />
                      입금 확인 후 주문이 진행됩니다.
                    </>
                  ) : (
                    <>
                      <strong>법인카드 결제가 완료되었습니다.</strong>
                      <br />
                      주문 처리가 곧 시작됩니다.
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => navigate("/")}
                className="flex-1 border-2 border-border text-muted-foreground hover:border-primary hover:text-primary py-3 rounded-lg font-semibold text-sm transition-colors"
              >
                홈으로
              </button>

              <button
                onClick={() => navigate("/orders")}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                주문 내역 보기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}