import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Star, Bookmark, ShoppingCart, Package, Truck, Shield, CheckCircle, Award, MapPin, Phone, Mail, Plus, Minus } from "lucide-react";

export function ProductDetail() {
  const [quantity, setQuantity] = useState(1000);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const product = {
    id: 1,
    name: "프리미엄 히알루론산 에센스 50mL",
    supplier: "코스맥스(주)",
    country: "한국",
    price: 12,
    unit: "/ea",
    moq: 1000,
    verified: true,
    images: [
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=600&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&h=600&fit=crop&auto=format",
    ],
    description: "피부 깊숙이 수분을 공급하는 프리미엄 히알루론산 에센스입니다. 저분자/중분자/고분자 히알루론산 3종을 배합하여 피부 표면부터 속까지 촘촘하게 수분을 채워줍니다.",
    features: [
      "3중 히알루론산 복합체 (저/중/고분자)",
      "무향료, 무알코올, 저자극 테스트 완료",
      "FDA 등록 제조시설 생산",
      "비건 인증, 동물실험 반대",
      "OEM/ODM 커스터마이징 가능",
    ],
    specs: {
      용량: "50mL",
      주요성분: "히알루론산나트륨, 글리세린, 나이아신아마이드",
      사용기한: "제조일로부터 3년",
      원산지: "대한민국",
      제조사: "코스맥스㈜",
      인증: "FDA 등록, ISO 22716, CGMP",
    },
    supplierInfo: {
      name: "코스맥스(주)",
      established: 1999,
      category: "OEM/ODM 화장품 전문",
      products: 1240,
      address: "경기도 성남시 분당구 판교로 123",
      phone: "031-1234-5678",
      email: "export@cosmax.com",
      certifications: ["FDA 등록", "ISO 22716", "CGMP", "HACCP"],
    },
  };

  const updateQuantity = (delta: number) => {
    const next = quantity + delta;
    if (next >= product.moq) {
      setQuantity(next);
    }
  };

  const total = product.price * quantity;

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
        <ArrowLeft size={16} />
        제품 목록으로 돌아가기
      </Link>

      <div className="grid grid-cols-[500px_1fr] gap-8 mb-8">
        {/* Left: Images */}
        <div>
          <div className="bg-white border border-border rounded-lg overflow-hidden mb-3">
            <img src={product.images[selectedImage]} alt={product.name} className="w-full h-[500px] object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {product.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`border-2 rounded overflow-hidden ${selectedImage === i ? "border-primary" : "border-border hover:border-primary/40"} transition-colors`}
              >
                <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-32 object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              {product.verified && (
                <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded font-semibold mb-2">인증 공급업체</span>
              )}
              <h1 className="text-2xl font-bold text-foreground leading-tight mb-2">{product.name}</h1>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Link to="/suppliers" className="hover:text-primary transition-colors font-medium">{product.supplier}</Link>
                <span>·</span>
                <span className="flex items-center gap-1"><MapPin size={13} />{product.country}</span>
              </div>
            </div>
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="border border-border rounded p-2 hover:border-primary transition-colors"
            >
              <Bookmark size={20} className={isBookmarked ? "fill-primary text-primary" : "text-muted-foreground"} />
            </button>
          </div>

          <div className="bg-muted/30 border border-border rounded-lg p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-bold text-primary font-mono">${product.price}</span>
              <span className="text-sm text-muted-foreground">{product.unit}</span>
            </div>
            <div className="text-sm text-muted-foreground mb-4">최소 주문 수량: {product.moq.toLocaleString()}개</div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">주문 수량</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(-100)}
                    className="w-10 h-10 border border-border rounded flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || product.moq;
                      if (val >= product.moq) setQuantity(val);
                    }}
                    className="flex-1 border border-border rounded px-4 py-2.5 text-center font-mono text-lg outline-none focus:border-primary transition-colors"
                  />
                  <button
                    onClick={() => updateQuantity(100)}
                    className="w-10 h-10 border border-border rounded flex items-center justify-center hover:border-primary hover:text-primary transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-sm text-muted-foreground">개</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-sm text-muted-foreground">합계 금액</span>
                <span className="text-2xl font-bold text-foreground font-mono">${total.toLocaleString()}</span>
              </div>

              <div className="flex gap-3 pt-3">
                <Link to="/cart" className="flex-1 bg-white border-2 border-primary text-primary hover:bg-secondary py-3.5 rounded font-semibold transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart size={18} />
                  장바구니 담기
                </Link>
                <Link to="/checkout" className="flex-1 bg-primary hover:bg-primary/90 text-white py-3.5 rounded font-semibold transition-colors flex items-center justify-center gap-2">
                  바로 구매하기
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Benefits */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: <Shield size={18} />, label: "안전결제", desc: "에스크로 보호" },
              { icon: <Truck size={18} />, label: "빠른 배송", desc: "항공/해운 선택" },
              { icon: <Award size={18} />, label: "품질 검수", desc: "출하 전 검사" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-border rounded p-3 text-center">
                <div className="text-primary mb-1 flex justify-center">{item.icon}</div>
                <div className="text-xs font-semibold text-foreground">{item.label}</div>
                <div className="text-[10px] text-muted-foreground">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <div className="border-b border-border flex">
          {["제품 설명", "제품 사양", "공급업체 정보"].map((tab) => (
            <button key={tab} className="px-6 py-3 text-sm font-medium text-foreground border-b-2 border-primary">
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h3 className="font-bold text-foreground mb-3">제품 설명</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{product.description}</p>
            <h4 className="font-semibold text-foreground mb-2 text-sm">주요 특징</h4>
            <ul className="space-y-2">
              {product.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Specs */}
          <div className="mb-8">
            <h3 className="font-bold text-foreground mb-3">제품 사양</h3>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex border-b border-border pb-2">
                  <span className="text-sm text-muted-foreground w-28 flex-shrink-0">{key}</span>
                  <span className="text-sm text-foreground font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Info */}
          <div>
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Award size={18} className="text-primary" />
              공급업체 정보
            </h3>
            <div className="bg-muted/30 border border-border rounded-lg p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-bold text-foreground text-lg mb-1">{product.supplierInfo.name}</h4>
                  <div className="text-sm text-muted-foreground">{product.supplierInfo.category}</div>
                </div>
                <span className="bg-primary text-white text-xs px-2 py-1 rounded font-semibold">인증 업체</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20">설립연도</span>
                    <span className="font-medium text-foreground">{product.supplierInfo.established}년</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20">등록 제품</span>
                    <span className="font-medium text-foreground">{product.supplierInfo.products.toLocaleString()}개</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 flex items-center gap-1"><MapPin size={12} />주소</span>
                    <span className="font-medium text-foreground">{product.supplierInfo.address}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 flex items-center gap-1"><Phone size={12} />전화</span>
                    <span className="font-medium text-foreground">{product.supplierInfo.phone}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground w-20 flex items-center gap-1"><Mail size={12} />이메일</span>
                    <span className="font-medium text-foreground text-xs">{product.supplierInfo.email}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-2">보유 인증</div>
                <div className="flex gap-2 flex-wrap">
                  {product.supplierInfo.certifications.map((cert) => (
                    <span key={cert} className="bg-white border border-border text-foreground text-xs px-3 py-1 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              <Link to="/suppliers" className="mt-4 w-full border border-primary text-primary hover:bg-secondary py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 block text-center">
                공급업체 페이지 방문
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
