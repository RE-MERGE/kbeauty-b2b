import { useState } from "react";
import { Plane, Ship, Zap, MapPin, Package, CheckCircle, Clock, ArrowRight, Copy, Home, User, X } from "lucide-react";

const shippingMethods = [
  {
    icon: <Plane size={32} />,
    name: "항공 배송",
    time: "3–7일",
    price: "kg당 $8~15",
    desc: "빠른 납기가 필요한 긴급 화물에 최적. 소량·고가 제품 권장.",
    suitable: ["긴급 납품", "소량 고가 화물", "샘플 배송", "전자·정밀기기"],
    color: "from-[#1a1a2e] to-[#2d3561]",
  },
  {
    icon: <Ship size={32} />,
    name: "해상 배송",
    time: "15–35일",
    price: "CBM당 $80~200",
    desc: "대량·중량 화물에 경제적. FCL/LCL 선택 가능.",
    suitable: ["대량 화물", "중량·부피 화물", "원자재·기계", "가구·인테리어"],
    color: "from-[#1a4a2e] to-[#2d6b41]",
  },
  {
    icon: <Zap size={32} />,
    name: "특송 (Express)",
    time: "1–3일",
    price: "건당 $25~80",
    desc: "FedEx·DHL·UPS 네트워크를 통한 도어투도어 초고속 배송.",
    suitable: ["서류·샘플", "소형 고가 제품", "최단 납기", "B2C 혼재"],
    color: "from-[#4a1a0a] to-[#8b3a1a]",
  },
];

const warehouses = [
  { flag: "🇨🇳", city: "선전 (Shenzhen)", address: "宝安区松岗街道TradeKR仓", area: "4,200㎡", feature: "검수·분류·재포장" },
  { flag: "🇨🇳", city: "상하이 (Shanghai)", address: "外高桥保税区B栋", area: "2,800㎡", feature: "보세창고 운영" },
  { flag: "🇻🇳", city: "호찌민 (Ho Chi Minh)", address: "Binh Duong Industrial Zone", area: "1,500㎡", feature: "의류·신발 전문" },
  { flag: "🇺🇸", city: "LA (Los Angeles)", address: "Carson, CA 90745", area: "800㎡", feature: "미주 물품 집하" },
];

const trackingSteps = [
  { status: "입고 완료", time: "2024.03.12 14:22", done: true },
  { status: "검수 진행중", time: "2024.03.13 09:15", done: true },
  { status: "출고 완료", time: "2024.03.14 11:40", done: true },
  { status: "통관 처리중", time: "2024.03.15 08:00", done: false },
  { status: "국내 배송중", time: "–", done: false },
  { status: "배송 완료", time: "–", done: false },
];

export function ShippingAgency() {
  const [selectedMethod, setSelectedMethod] = useState(0);
  const [weight, setWeight] = useState("");
  const [cbm, setCbm] = useState("");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);

  const estimatedAir = weight ? `$${(parseFloat(weight) * 12).toFixed(0)}` : "–";
  const estimatedSea = cbm ? `$${(parseFloat(cbm) * 150).toFixed(0)}` : "–";

  const myAddress = {
    recipient: "TradeKR 인천물류창고",
    address: "인천광역시 중구 공항로 123",
    detail: "TradeKR 3동 B-구역",
    code: "TKR-KR-20941",
    phone: "032-000-0000",
    zipcode: "22382",
  };

  const fullAddressText = `[수령인] ${myAddress.recipient}\n[주소] ${myAddress.address} ${myAddress.detail}\n[우편번호] ${myAddress.zipcode}\n[관리코드] ${myAddress.code}\n[연락처] ${myAddress.phone}`;

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(fullAddressText).then(() => {
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2500);
    });
  };

  return (
    <div className="font-[Inter,sans-serif]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1a2e1a] to-[#0e1a2e] text-white py-16">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-block bg-primary text-xs font-mono px-2 py-1 rounded mb-4 tracking-wider uppercase">배송대행 서비스</div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              해외 창고에서<br />
              <span className="text-accent">국내 현관까지</span> 책임 배송
            </h1>
            <p className="text-[#ccc] text-base leading-relaxed mb-6">
              현지 창고 입고부터 통관, 내륙 배송까지 TradeKR이 전 구간을 처리합니다. 복잡한 서류 작업은 저희에게 맡기세요.
            </p>
            <div className="flex gap-4">
              <a href="#calculator" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded font-semibold transition-colors">
                운임 계산하기
              </a>
              <a href="#warehouses" className="border border-white/30 hover:bg-white/10 text-white px-8 py-3 rounded font-medium transition-colors">
                창고 안내
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-primary text-white">
        <div className="max-w-[1280px] mx-auto px-4 grid grid-cols-4 divide-x divide-white/20">
          {[
            { label: "월 처리 물량", value: "18,000건+" },
            { label: "운영 창고", value: "4개국 6곳" },
            { label: "평균 통관 시간", value: "36시간" },
            { label: "파손·분실률", value: "0.02%" },
          ].map((s) => (
            <div key={s.label} className="py-4 text-center">
              <div className="font-bold text-2xl font-mono">{s.value}</div>
              <div className="text-sm text-white/70">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-12">

        {/* Shipping Methods */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-2">배송 방법 선택</h2>
          <p className="text-muted-foreground mb-8">화물의 특성과 납기에 맞는 최적의 방법을 선택하세요</p>
          <div className="grid grid-cols-3 gap-6">
            {shippingMethods.map((method, i) => (
              <div
                key={method.name}
                onClick={() => setSelectedMethod(i)}
                className={`rounded border-2 overflow-hidden cursor-pointer transition-all ${
                  selectedMethod === i ? "border-primary shadow-lg" : "border-border hover:border-primary/40"
                }`}
              >
                <div className={`bg-gradient-to-r ${method.color} text-white p-5`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div>{method.icon}</div>
                    <div>
                      <div className="font-bold text-lg">{method.name}</div>
                      <div className="text-sm text-white/70 font-mono">{method.time}</div>
                    </div>
                  </div>
                  <div className="text-sm text-white/80">{method.price}</div>
                </div>
                <div className="bg-white p-5">
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{method.desc}</p>
                  <div className="space-y-1.5">
                    {method.suitable.map((s) => (
                      <div key={s} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calculator + Tracking */}
        <div className="grid grid-cols-2 gap-8 mb-16">
          {/* Calculator */}
          <section id="calculator" className="bg-white border border-border rounded p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">운임 간편 계산기</h2>
            <p className="text-sm text-muted-foreground mb-5">실제 운임은 화물 상세 정보에 따라 달라질 수 있습니다</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#333] mb-1.5 flex items-center gap-2">
                  <Plane size={14} className="text-primary" /> 항공 — 무게 (kg)
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="예: 25"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <div className="mt-2 text-sm font-mono text-primary">예상 항공 운임: {estimatedAir}</div>
              </div>
              <div className="border-t border-border pt-4">
                <label className="block text-sm font-medium text-[#333] mb-1.5 flex items-center gap-2">
                  <Ship size={14} className="text-primary" /> 해상 — 부피 (CBM)
                </label>
                <input
                  type="number"
                  value={cbm}
                  onChange={(e) => setCbm(e.target.value)}
                  placeholder="예: 2.5"
                  className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                />
                <div className="mt-2 text-sm font-mono text-primary">예상 해상 운임: {estimatedSea}</div>
              </div>
            </div>
            <button
              onClick={() => setShowQuoteModal(true)}
              className="mt-5 w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              정밀 견적 요청 <ArrowRight size={16} />
            </button>
          </section>

          {/* Tracking Sample */}
          <section className="bg-white border border-border rounded p-6">
            <h2 className="text-xl font-bold text-foreground mb-1">배송 추적 (샘플)</h2>
            <p className="text-sm text-muted-foreground mb-5">운송장번호: <span className="font-mono text-primary">TKR-2024-083421</span></p>
            <div className="relative">
              <div className="absolute left-[19px] top-0 bottom-0 w-px bg-muted" />
              <div className="space-y-4">
                {trackingSteps.map((step, i) => (
                  <div key={step.status} className="flex items-start gap-4 relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${step.done ? "bg-primary" : "bg-muted"}`}>
                      {step.done
                        ? <CheckCircle size={18} className="text-white" />
                        : <Clock size={18} className="text-[#bbb]" />
                      }
                    </div>
                    <div className="pt-1">
                      <div className={`text-sm font-semibold ${step.done ? "text-foreground" : "text-[#bbb]"}`}>{step.status}</div>
                      <div className="text-xs text-muted-foreground font-mono">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Shipping Address Issuance (BE4) */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-2">배송대행지 주소 발급</h2>
          <p className="text-muted-foreground mb-8">바이어 1인당 고유 주소를 발급받아 해외 공급업체 발송 시 사용하세요</p>
          <div className="grid grid-cols-2 gap-8">
            {/* How it works */}
            <div className="bg-white border border-border rounded p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2"><Home size={18} className="text-primary" />이용 방법</h3>
              <div className="space-y-4">
                {[
                  { step: "01", title: "주소 발급 신청", desc: "로그인 후 배송대행지 주소 발급 버튼을 클릭하면 즉시 고유 주소가 생성됩니다." },
                  { step: "02", title: "공급업체에 주소 전달", desc: "발급된 창고 주소와 개인 관리코드를 셀러(공급업체)에게 배송지로 안내합니다." },
                  { step: "03", title: "입고 알림 수신", desc: "물품이 창고에 입고되면 이메일로 알림을 받습니다. 검수 후 출고 요청을 진행하세요." },
                  { step: "04", title: "국내 배송 신청", desc: "목적지·배송 방법을 선택하고 출고 신청하면 최종 배송지까지 처리됩니다." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="font-mono text-xs text-primary font-bold bg-secondary px-2 py-0.5 rounded flex-shrink-0 mt-0.5">{item.step}</div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{item.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample address card */}
            <div className="bg-white border border-border rounded p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2"><User size={18} className="text-primary" />발급 주소 예시</h3>
              <div className="bg-secondary border border-primary/20 rounded p-5 mb-4">
                <div className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-mono">배송대행지 주소 (샘플)</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">수령인</span>
                    <span className="font-semibold text-foreground">TradeKR 인천물류창고</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">주소</span>
                    <span className="font-medium text-foreground">인천광역시 중구 공항로 123</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">상세주소</span>
                    <span className="font-medium text-foreground">TradeKR 3동 B-구역</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">관리코드</span>
                    <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border border-primary/30 text-sm">TKR-KR-20941</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">연락처</span>
                    <span className="font-medium text-foreground">032-000-0000</span>
                  </div>
                </div>
                <button className="mt-4 w-full border border-primary text-primary hover:bg-primary hover:text-white text-xs py-2 rounded font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Copy size={13} /> 주소 복사하기
                </button>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 leading-relaxed">
                <span className="font-semibold">주의:</span> 배송지 입력 시 반드시 <strong>관리코드(TKR-KR-XXXXX)</strong>를 수령인 이름 또는 상세주소에 포함해야 물품 식별이 가능합니다.
              </div>
              <button
                onClick={() => setShowAddressModal(true)}
                className="mt-4 w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                내 배송대행지 주소 발급받기 <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

      </div>

      {/* 정밀 견적 요청 완료 모달 */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowQuoteModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">정밀 견적 요청이 접수되었습니다!</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                입력하신 화물 정보를 바탕으로 <strong className="text-foreground">영업일 기준 1~2일 내</strong> 정밀 운임 견적서를 이메일로 발송해 드립니다.
              </p>
              <div className="bg-secondary border border-primary/20 rounded p-4 mb-5 text-left space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">접수 번호</span>
                  <span className="font-mono font-bold text-primary">FRT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9000) + 1000)}</span>
                </div>
                {weight && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">항공 (무게)</span>
                    <span className="font-medium text-foreground">{weight} kg → 예상 {estimatedAir}</span>
                  </div>
                )}
                {cbm && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">해상 (CBM)</span>
                    <span className="font-medium text-foreground">{cbm} CBM → 예상 {estimatedSea}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">접수 시각</span>
                  <span className="text-foreground">{new Date().toLocaleString("ko-KR")}</span>
                </div>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded font-semibold text-sm transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 배송대행지 주소 발급 모달 */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button onClick={() => setShowAddressModal(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <MapPin size={16} className="text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground">내 배송대행지 주소</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">아래 주소로 해외 쇼핑몰에서 구매하시면 TradeKR 창고로 입고됩니다.</p>
            <div className="bg-secondary border border-primary/20 rounded p-5 mb-4 space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">수령인</span>
                <span className="font-semibold text-foreground text-right">{myAddress.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">주소</span>
                <span className="font-medium text-foreground text-right">{myAddress.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">상세주소</span>
                <span className="font-medium text-foreground text-right">{myAddress.detail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">우편번호</span>
                <span className="font-mono font-medium text-foreground">{myAddress.zipcode}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground w-20 flex-shrink-0">관리코드</span>
                <span className="font-mono font-bold text-primary bg-white px-2 py-0.5 rounded border border-primary/30">{myAddress.code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20 flex-shrink-0">연락처</span>
                <span className="font-medium text-foreground">{myAddress.phone}</span>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-800 leading-relaxed mb-4">
              <strong>필수:</strong> 구매 시 수령인 이름 또는 메모란에 반드시 <strong>관리코드({myAddress.code})</strong>를 포함해 주세요.
            </div>
            <button
              onClick={handleCopyAddress}
              className={`w-full py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${addressCopied ? "bg-green-500 text-white" : "bg-primary hover:bg-primary/90 text-white"}`}
            >
              {addressCopied ? (
                <><CheckCircle size={16} /> 주소가 복사되었습니다!</>
              ) : (
                <><Copy size={16} /> 전체 주소 복사하기</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
