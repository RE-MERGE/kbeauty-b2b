import { useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router";
import { Eye, EyeOff, Upload, CheckCircle, ArrowRight, User, Building2, Mail, KeyRound, Store, Globe, AlertCircle } from "lucide-react";

type Tab = "login" | "signup" | "find";
type Role = "buyer" | "seller";
type StoreType = "offline" | "online" | "both";
type MemberType = "ceo" | "employee";

export function Login() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const initialRole = searchParams.get("role") === "seller" ? "seller" : "buyer";

  const [tab, setTab] = useState<Tab>(initialTab);
  const [role, setRole] = useState<Role>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [findType, setFindType] = useState<"id" | "pw">("id");
  const [findEmail, setFindEmail] = useState("");
  const [findPhone, setFindPhone] = useState("");
  const [findSubmitted, setFindSubmitted] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [buyerForm, setBuyerForm] = useState({ companyName: "", contactName: "", businessNo: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [sellerForm, setSellerForm] = useState({
    businessName: "",
    businessNo: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    storeType: "online" as StoreType,
    shopUrl: "",
    memberType: "ceo" as MemberType,
    ceoName: "",
    file: "",
  });

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center py-12 px-8">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">가입 신청이 완료되었습니다</h2>
          <p className="text-muted-foreground mb-2 max-w-md">
            가입 상태가 <strong>검토 중(PENDING)</strong>으로 처리되었습니다.<br />
            담당자 확인 후 승인 완료 이메일을 발송해 드립니다.
          </p>
          <p className="text-xs text-muted-foreground mb-8">승인 완료 후 모든 서비스를 이용하실 수 있습니다. (영업일 기준 1~2일 소요)</p>
          <Link to="/" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded font-semibold text-sm transition-colors inline-flex items-center gap-2">
            홈으로 돌아가기 <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

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
            <div className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">국내 패션 B2B 도매 플랫폼</div>
          </Link>
        </div>

        {/* Tab: Login / Signup / Find */}
        <div className="flex border border-border rounded overflow-hidden mb-6">
          <button
            onClick={() => { setTab("login"); setFindSubmitted(false); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "login" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary"}`}
          >
            로그인
          </button>
          <button
            onClick={() => { setTab("signup"); setFindSubmitted(false); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "signup" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary"}`}
          >
            회원가입
          </button>
          <button
            onClick={() => { setTab("find"); setFindSubmitted(false); }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${tab === "find" ? "bg-primary text-white" : "bg-white text-muted-foreground hover:text-primary"}`}
          >
            아이디·비밀번호 찾기
          </button>
        </div>

        <div className="bg-white border border-border rounded p-8">

          {tab === "login" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-6">로그인</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">이메일</label>
                  <input
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="your@company.com"
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="비밀번호 입력"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors pr-10"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer text-muted-foreground">
                    <input type="checkbox" className="rounded" />
                    로그인 상태 유지
                  </label>
                  <button onClick={() => { setTab("find"); setFindType("pw"); }} className="text-primary hover:underline">아이디·비밀번호 찾기</button>
                </div>
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors">
                  로그인
                </button>
              </div>
              <div className="mt-5 text-center text-sm text-muted-foreground">
                계정이 없으신가요?{" "}
                <button onClick={() => setTab("signup")} className="text-primary font-semibold hover:underline">
                  회원가입
                </button>
              </div>
            </div>
          )}

          {tab === "signup" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">회원가입</h2>
              <p className="text-sm text-muted-foreground mb-5">가입 후 담당자 확인을 거쳐 계정이 활성화됩니다.</p>

              {/* Role Selection */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  onClick={() => setRole("buyer")}
                  className={`border-2 rounded p-4 text-left transition-all ${role === "buyer" ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}
                >
                  <User size={22} className={`mb-2 ${role === "buyer" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`font-semibold text-sm ${role === "buyer" ? "text-primary" : "text-foreground"}`}>바이어</div>
                  <div className="text-xs text-muted-foreground mt-0.5">의류를 도매로 구매하는 소매 사업자</div>
                </button>
                <button
                  onClick={() => setRole("seller")}
                  className={`border-2 rounded p-4 text-left transition-all ${role === "seller" ? "border-primary bg-secondary" : "border-border hover:border-primary/40"}`}
                >
                  <Building2 size={22} className={`mb-2 ${role === "seller" ? "text-primary" : "text-muted-foreground"}`} />
                  <div className={`font-semibold text-sm ${role === "seller" ? "text-primary" : "text-foreground"}`}>셀러 (공급업체)</div>
                  <div className="text-xs text-muted-foreground mt-0.5">의류를 도매로 공급하는 셀러·브랜드</div>
                </button>
              </div>

              {/* Buyer Form */}
              {role === "buyer" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">법인명 / 상호명</label>
                    <input
                      type="text"
                      value={buyerForm.companyName}
                      onChange={(e) => setBuyerForm({ ...buyerForm, companyName: e.target.value })}
                      placeholder="(주)패션코리아 / 홍길동 의류"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">사업자등록번호</label>
                    <input
                      type="text"
                      value={buyerForm.businessNo}
                      onChange={(e) => setBuyerForm({ ...buyerForm, businessNo: e.target.value })}
                      placeholder="000-00-00000"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">담당자명</label>
                    <input
                      type="text"
                      value={buyerForm.contactName}
                      onChange={(e) => setBuyerForm({ ...buyerForm, contactName: e.target.value })}
                      placeholder="홍길동"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={buyerForm.phone}
                      onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={buyerForm.email}
                      onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })}
                      placeholder="your@company.com"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호</label>
                    <input
                      type="password"
                      value={buyerForm.password}
                      onChange={(e) => setBuyerForm({ ...buyerForm, password: e.target.value })}
                      placeholder="8자 이상"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호 확인</label>
                    <input
                      type="password"
                      value={buyerForm.confirmPassword}
                      onChange={(e) => setBuyerForm({ ...buyerForm, confirmPassword: e.target.value })}
                      placeholder="비밀번호 재입력"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Seller Form */}
              {role === "seller" && (
                <div className="space-y-4">
                  {/* 회원 유형 */}
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-2">회원 유형</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSellerForm({ ...sellerForm, memberType: "ceo" })}
                        className={`flex items-center gap-2 border-2 rounded px-3 py-2.5 text-sm transition-all ${sellerForm.memberType === "ceo" ? "border-primary bg-secondary text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        <User size={16} />
                        대표자
                      </button>
                      <button
                        type="button"
                        onClick={() => setSellerForm({ ...sellerForm, memberType: "employee" })}
                        className={`flex items-center gap-2 border-2 rounded px-3 py-2.5 text-sm transition-all ${sellerForm.memberType === "employee" ? "border-primary bg-secondary text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/40"}`}
                      >
                        <User size={16} />
                        직원
                      </button>
                    </div>
                    {sellerForm.memberType === "employee" && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2 mt-2">
                        직원으로 가입 시 대표자 동의서 및 재직증명서가 추가로 필요합니다.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">상호명 (법인명)</label>
                    <input
                      type="text"
                      value={sellerForm.businessName}
                      onChange={(e) => setSellerForm({ ...sellerForm, businessName: e.target.value })}
                      placeholder="(주)동대문패션 / 홍길동의류"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">대표자명</label>
                    <input
                      type="text"
                      value={sellerForm.ceoName}
                      onChange={(e) => setSellerForm({ ...sellerForm, ceoName: e.target.value })}
                      placeholder="홍길동"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">사업자등록번호</label>
                    <input
                      type="text"
                      value={sellerForm.businessNo}
                      onChange={(e) => setSellerForm({ ...sellerForm, businessNo: e.target.value })}
                      placeholder="000-00-00000"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>

                  {/* 매장 타입 */}
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-2">매장 타입</label>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: "offline", label: "오프라인", icon: <Store size={14} /> },
                        { value: "online", label: "온라인", icon: <Globe size={14} /> },
                        { value: "both", label: "온·오프라인", icon: <><Store size={12} /><Globe size={12} /></> },
                      ] as { value: StoreType; label: string; icon: ReactNode }[]).map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSellerForm({ ...sellerForm, storeType: opt.value })}
                          className={`flex flex-col items-center gap-1.5 border-2 rounded px-2 py-2.5 text-xs transition-all ${sellerForm.storeType === opt.value ? "border-primary bg-secondary text-primary font-semibold" : "border-border text-muted-foreground hover:border-primary/40"}`}
                        >
                          <span className="flex gap-0.5">{opt.icon}</span>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 쇼핑몰 주소 (온라인 또는 온오프라인인 경우) */}
                  {(sellerForm.storeType === "online" || sellerForm.storeType === "both") && (
                    <div>
                      <label className="block text-sm font-medium text-[#333] mb-1.5">
                        쇼핑몰 주소 <span className="text-primary text-xs">(필수)</span>
                      </label>
                      <input
                        type="url"
                        value={sellerForm.shopUrl}
                        onChange={(e) => setSellerForm({ ...sellerForm, shopUrl: e.target.value })}
                        placeholder="https://smartstore.naver.com/mystore"
                        className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                      />
                      <p className="text-xs text-muted-foreground mt-1">네이버 스마트스토어, 쿠팡, 자체 쇼핑몰 URL 등</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">휴대폰 번호</label>
                    <input
                      type="tel"
                      value={sellerForm.phone}
                      onChange={(e) => setSellerForm({ ...sellerForm, phone: e.target.value })}
                      placeholder="010-0000-0000"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">이메일</label>
                    <input
                      type="email"
                      value={sellerForm.email}
                      onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                      placeholder="your@company.com"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호</label>
                    <input
                      type="password"
                      value={sellerForm.password}
                      onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })}
                      placeholder="8자 이상"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">비밀번호 확인</label>
                    <input
                      type="password"
                      value={sellerForm.confirmPassword}
                      onChange={(e) => setSellerForm({ ...sellerForm, confirmPassword: e.target.value })}
                      placeholder="비밀번호 재입력"
                      className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333] mb-1.5">사업자등록증 첨부 (PDF)</label>
                    <div className="border-2 border-dashed border-border rounded p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                      <div className="text-sm text-muted-foreground">클릭하여 파일을 업로드하세요</div>
                      <div className="text-xs text-muted-foreground mt-0.5">PDF, 최대 10MB</div>
                    </div>
                  </div>

                  {/* 가입 불가 안내 */}
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      일부 업태·업종은 셀러 가입이 제한됩니다.{" "}
                      <Link to="/restricted-businesses" className="text-amber-800 font-semibold underline">
                        가입 불가 업태/업종 확인하기 →
                      </Link>
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-2">
                <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer mt-4">
                  <input type="checkbox" className="mt-0.5 flex-shrink-0" />
                  <span><a href="#" className="text-primary underline">이용약관</a> 및 <a href="#" className="text-primary underline">개인정보 처리방침</a>에 동의합니다.</span>
                </label>
              </div>

              <button
                onClick={() => setSubmitted(true)}
                className="w-full mt-5 bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {role === "buyer" ? "바이어로 가입하기" : "셀러로 가입하기"} <ArrowRight size={16} />
              </button>

              <div className="mt-4 text-center text-sm text-muted-foreground">
                이미 계정이 있으신가요?{" "}
                <button onClick={() => setTab("login")} className="text-primary font-semibold hover:underline">
                  로그인
                </button>
              </div>
            </div>
          )}

          {tab === "find" && (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-2">아이디 · 비밀번호 찾기</h2>
              <p className="text-sm text-muted-foreground mb-5">가입 시 등록한 정보로 계정을 찾을 수 있습니다.</p>

              {/* Find type toggle */}
              <div className="flex border border-border rounded overflow-hidden mb-6">
                <button
                  onClick={() => { setFindType("id"); setFindSubmitted(false); }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${findType === "id" ? "bg-secondary text-primary border-b-2 border-primary" : "bg-white text-muted-foreground hover:text-primary"}`}
                >
                  <Mail size={14} className="inline mr-1.5" />아이디 찾기
                </button>
                <button
                  onClick={() => { setFindType("pw"); setFindSubmitted(false); }}
                  className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${findType === "pw" ? "bg-secondary text-primary border-b-2 border-primary" : "bg-white text-muted-foreground hover:text-primary"}`}
                >
                  <KeyRound size={14} className="inline mr-1.5" />비밀번호 찾기
                </button>
              </div>

              {!findSubmitted ? (
                <div className="space-y-4">
                  {findType === "id" ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">담당자명</label>
                        <input
                          type="text"
                          placeholder="가입 시 등록한 이름"
                          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">휴대폰 번호</label>
                        <input
                          type="tel"
                          value={findPhone}
                          onChange={(e) => setFindPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
                        입력하신 정보로 등록된 이메일 주소 일부를 마스킹하여 보여드립니다.
                      </p>
                      <button
                        onClick={() => setFindSubmitted(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        아이디 찾기 <ArrowRight size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">가입 이메일 (아이디)</label>
                        <input
                          type="email"
                          value={findEmail}
                          onChange={(e) => setFindEmail(e.target.value)}
                          placeholder="your@company.com"
                          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#333] mb-1.5">휴대폰 번호</label>
                        <input
                          type="tel"
                          value={findPhone}
                          onChange={(e) => setFindPhone(e.target.value)}
                          placeholder="010-0000-0000"
                          className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground bg-muted/40 rounded p-3">
                        입력하신 이메일로 비밀번호 재설정 링크가 발송됩니다.
                      </p>
                      <button
                        onClick={() => setFindSubmitted(true)}
                        className="w-full bg-primary hover:bg-primary/90 text-white py-3 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        재설정 링크 발송 <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 px-4">
                  <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={28} className="text-primary" />
                  </div>
                  {findType === "id" ? (
                    <>
                      <h3 className="font-bold text-foreground mb-2">아이디 조회 결과</h3>
                      <p className="text-sm text-muted-foreground mb-3">입력하신 정보와 일치하는 계정을 찾았습니다.</p>
                      <div className="bg-secondary border border-primary/20 rounded p-4 mb-4 text-left">
                        <div className="text-xs text-muted-foreground mb-1">등록된 이메일 (아이디)</div>
                        <div className="font-mono font-semibold text-foreground">fa***ion@example.com</div>
                        <div className="text-xs text-muted-foreground mt-2">가입일: 2025.03.15</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-foreground mb-2">비밀번호 재설정 이메일 발송</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        <strong className="text-foreground">{findEmail || "입력하신 이메일"}</strong>로<br />
                        비밀번호 재설정 링크를 발송했습니다.
                      </p>
                      <div className="bg-amber-50 border border-amber-200 rounded p-3 text-xs text-amber-700 mb-4">
                        이메일이 도착하지 않으면 스팸 폴더를 확인하거나 재발송을 요청하세요. (유효시간: 30분)
                      </div>
                    </>
                  )}
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={() => { setFindSubmitted(false); setFindEmail(""); setFindPhone(""); }}
                      className="border border-border text-muted-foreground hover:border-primary hover:text-primary px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      다시 찾기
                    </button>
                    <button
                      onClick={() => setTab("login")}
                      className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
                    >
                      로그인하기
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
