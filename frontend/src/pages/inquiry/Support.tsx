import { useState } from "react";
import { ChevronDown, ChevronUp, Phone, Mail, MessageSquare, Clock, Send } from "lucide-react";

const faqs = [
  {
    q: "구매대행 수수료는 어떻게 계산되나요?",
    a: "구매대행 수수료는 구매 금액의 5~8% (플랜에 따라 상이)입니다. 비즈니스 플랜 이상은 월정액에 포함되어 건당 추가 수수료가 없습니다. 물류비, 관세, 검수비는 별도 실비로 청구됩니다.",
  },
  {
    q: "해외 공급업체와 언어 소통이 안 되는데 어떻게 하나요?",
    a: "TradeKR 전담 매니저가 영어·중국어·베트남어·일본어 소통을 대행합니다. 고객은 한국어로 요청사항만 전달하면 되며, 협상·계약·클레임 처리까지 모두 대행합니다.",
  },
  {
    q: "품질이 불량할 경우 어떻게 처리되나요?",
    a: "출하 전 현지 검수를 통해 불량품을 사전 차단합니다. 만약 국내 도착 후 불량이 확인되면 에스크로로 보관 중인 대금에서 환급 또는 재출하 처리됩니다. 분쟁 조정 서비스를 통해 공급업체와 협의합니다.",
  },
  {
    q: "최소 주문 수량(MOQ) 미달 시에도 주문이 가능한가요?",
    a: "TradeKR은 다수 바이어의 주문을 합산하는 공동구매(Grouping) 서비스를 제공합니다. MOQ 미달 소량 주문도 합산 처리하여 정상 가격에 구매 가능합니다. 단, 리드타임이 다소 길어질 수 있습니다.",
  },
  {
    q: "배송대행 이용 시 해외 창고 주소는 어떻게 받나요?",
    a: "회원가입 후 마이페이지 > 배송대행 창고 메뉴에서 지역별 창고 주소와 개인 고유 코드를 발급받습니다. 해외 쇼핑몰 배송지에 해당 창고 주소와 코드를 입력하면 됩니다.",
  },
  {
    q: "통관 거부가 발생하면 어떻게 되나요?",
    a: "TradeKR 관세사가 거부 사유를 확인하고 서류 보완 또는 재신고를 처리합니다. 규제 품목으로 인한 반송 시에는 현지 보관 또는 처리 방법을 고객과 협의합니다. 서류 오류로 인한 추가 비용은 당사가 부담합니다.",
  },
];

const announcements = [
  { date: "2024.03.15", tag: "서비스", title: "선전 창고 확장 이전 안내 (3월 25일)", important: true },
  { date: "2024.03.10", tag: "시스템", title: "4월 1일 정기 점검 예정 (02:00–06:00)", important: false },
  { date: "2024.03.05", tag: "서비스", title: "한-인도 FTA 품목 관세율 개정 적용 안내", important: false },
  { date: "2024.02.28", tag: "이벤트", title: "신규 가입 기업 구매대행 수수료 50% 할인 이벤트", important: true },
  { date: "2024.02.20", tag: "정책", title: "개인정보 처리방침 개정 안내 (2024.03.01 시행)", important: false },
];

export function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", category: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="font-[Inter,sans-serif]">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1a1a2e] to-[#1a2e1a] text-white py-12">
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="inline-block bg-primary text-xs font-mono px-2 py-1 rounded mb-4 tracking-wider uppercase">고객센터</div>
          <h1 className="text-4xl font-bold mb-3">무엇을 도와드릴까요?</h1>
          <p className="text-[#ccc]">TradeKR 전문 상담팀이 평일 09:00–18:00 운영 중입니다.</p>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 py-12">

        {/* Contact Cards */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: <Phone size={28} />, title: "전화 상담", detail: "1588-0000", sub: "평일 09:00–18:00", action: "전화하기" },
            { icon: <MessageSquare size={28} />, title: "1:1 채팅", detail: "실시간 상담", sub: "평균 응답 3분 이내", action: "채팅 시작" },
            { icon: <Mail size={28} />, title: "이메일 문의", detail: "support@tradekr.com", sub: "24시간 접수, 1영업일 내 답변", action: "메일 보내기" },
          ].map((c) => (
            <div key={c.title} className="bg-white border border-border rounded p-6 text-center hover:border-primary hover:shadow-md transition-all group">
              <div className="text-primary mx-auto mb-3 inline-block group-hover:scale-110 transition-transform">{c.icon}</div>
              <h3 className="font-semibold text-foreground mb-1">{c.title}</h3>
              <div className="text-base font-bold text-primary mb-1">{c.detail}</div>
              <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 mb-4">
                <Clock size={11} />{c.sub}
              </div>
              <button className="border border-primary text-primary hover:bg-primary hover:text-white text-sm px-5 py-2 rounded font-medium transition-colors w-full">
                {c.action}
              </button>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-8 mb-12">
          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">자주 묻는 질문</h2>
            <div className="space-y-2">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-border rounded overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary transition-colors"
                  >
                    <span className="font-medium text-foreground text-sm pr-4">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp size={16} className="text-primary flex-shrink-0" />
                      : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-muted pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Inquiry Form */}
          <section className="bg-white border border-border rounded p-6 self-start">
            <h2 className="text-xl font-bold text-foreground mb-1">1:1 문의하기</h2>
            <p className="text-sm text-muted-foreground mb-5">1영업일 내 이메일로 답변드립니다</p>
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">✅</div>
                <div className="font-semibold text-foreground mb-1">문의가 접수되었습니다</div>
                <div className="text-sm text-muted-foreground">1영업일 내 {form.email}로 답변드리겠습니다.</div>
                <button onClick={() => { setSubmitted(false); setForm({ name: "", email: "", category: "", message: "" }); }}
                  className="mt-5 text-sm text-primary hover:underline">
                  새 문의 작성
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">이름</label>
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="홍길동" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">이메일</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@company.com" className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">문의 유형</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary bg-white">
                    <option value="">선택하세요</option>
                    <option>구매대행</option>
                    <option>배송대행</option>
                    <option>통관/관세</option>
                    <option>결제/정산</option>
                    <option>공급업체 등록</option>
                    <option>기타</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">문의 내용</label>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="문의 내용을 상세히 입력해주세요" rows={4}
                    className="w-full border border-border rounded px-3 py-2.5 text-sm outline-none focus:border-primary transition-colors resize-none" />
                </div>
                <button
                  onClick={() => { if (form.name && form.email && form.message) setSubmitted(true); }}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  문의 제출 <Send size={15} />
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Announcements */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">공지사항</h2>
          <div className="bg-white border border-border rounded overflow-hidden">
            {announcements.map((a, i) => (
              <div key={i} className={`flex items-center gap-4 px-5 py-4 border-b border-muted last:border-0 hover:bg-secondary transition-colors cursor-pointer`}>
                <span className="text-xs text-muted-foreground font-mono w-20 flex-shrink-0">{a.date}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold flex-shrink-0 ${
                  a.important ? "bg-secondary text-primary border border-primary/20" : "bg-muted text-muted-foreground"
                }`}>{a.tag}</span>
                <span className="text-sm text-foreground hover:text-primary transition-colors flex-1">{a.title}</span>
                {a.important && <span className="text-[10px] text-primary font-bold flex-shrink-0">중요</span>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
