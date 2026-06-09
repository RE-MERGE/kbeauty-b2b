import { useState } from "react";
import { ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

// AGREEMENTS.terms        → 이용약관
// AGREEMENTS.privacy      → 개인정보 처리방침
// AGREEMENTS.thirdParty   → 제3자 제공
// AGREEMENTS.marketing    → 마케팅 수신 (선택)

// BUYER_AGREEMENTS   → [terms, privacy, thirdParty, marketing]
// SELLER_AGREEMENTS  → [terms, privacy, marketing]

// ─── Types ───────────────────────────────────────────────────────────────────

export type Agreement = {
  id: string;
  label: string;
  required: boolean;
  /** 인라인 펼치기 내용 (content 또는 href 중 하나) */
  content?: string;
  /** 외부/내부 링크 (새 탭 또는 페이지 이동) */
  href?: string;
};

export type AgreementCardProps = {
  agreements: Agreement[];
  /** 체크된 id 배열 */
  value: string[];
  onChange: (ids: string[]) => void;
  /** 필수 항목이 모두 체크됐는지 여부 (submit 버튼 disabled 등에 활용) */
  onValidChange?: (valid: boolean) => void;
};

// ─── 기본 약관 프리셋 (필요에 따라 조합해서 사용) ─────────────────────────────

export const AGREEMENTS = {
  terms: {
    id: "terms",
    label: "이용약관 동의",
    required: true,
    content: `제1조 (목적)\n본 약관은 StyleHub(이하 "회사")가 제공하는 B2B 패션 도매 플랫폼 서비스의 이용 조건 및 절차, 회사와 회원 간의 권리·의무 및 책임 사항을 규정함을 목적으로 합니다.\n\n제2조 (용어의 정의)\n① "서비스"란 회사가 제공하는 모든 온라인 도매 거래 중개 서비스를 말합니다.\n② "회원"이란 본 약관에 동의하고 서비스를 이용하는 사업자를 말합니다.\n\n제3조 (약관의 효력 및 변경)\n회사는 필요한 경우 약관을 변경할 수 있으며, 변경 시 사전 고지합니다.`,
  } satisfies Agreement,

  privacy: {
    id: "privacy",
    label: "개인정보 처리방침 동의",
    required: true,
    content: `1. 수집하는 개인정보 항목\n- 필수: 이메일, 비밀번호, 담당자명, 연락처, 사업자등록번호, 상호명, 대표자명\n- 선택: 선호 카테고리\n\n2. 개인정보의 수집 및 이용 목적\n- 서비스 제공 및 계약 이행\n- 회원 관리 및 본인 확인\n- 세금계산서 발행 및 정산\n- 고객 문의 처리\n\n3. 개인정보의 보유 및 이용 기간\n- 회원 탈퇴 후 30일 이내 파기\n- 단, 관련 법령에 따라 일정 기간 보존\n\n4. 개인정보의 제3자 제공\n회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.`,
  } satisfies Agreement,

  thirdParty: {
    id: "thirdParty",
    label: "개인정보 제3자 제공 동의",
    required: true,
    content: `제공받는 자: 물류사(CJ대한통운, 한진택배 등)\n제공 항목: 수령인명, 배송지 주소, 연락처\n제공 목적: 상품 배송 처리\n보유 기간: 배송 완료 후 6개월`,
  } satisfies Agreement,

  marketing: {
    id: "marketing",
    label: "마케팅 정보 수신 동의 (선택)",
    required: false,
    content: `신규 상품 입고 알림, 할인 이벤트, 트렌드 리포트 등 유용한 정보를 이메일 및 SMS로 받아보실 수 있습니다.\n수신 동의 후 마이페이지에서 언제든지 철회 가능합니다.`,
  } satisfies Agreement,
} as const;

/** 바이어 가입용 기본 세트 */
export const BUYER_AGREEMENTS: Agreement[] = [
  AGREEMENTS.terms,
  AGREEMENTS.privacy,
  AGREEMENTS.thirdParty,
  AGREEMENTS.marketing,
];

/** 셀러 가입용 기본 세트 */
export const SELLER_AGREEMENTS: Agreement[] = [
  AGREEMENTS.terms,
  AGREEMENTS.privacy,
  AGREEMENTS.marketing,
];

// ─── Component ───────────────────────────────────────────────────────────────

export function AgreementCard({ agreements, value, onChange, onValidChange }: AgreementCardProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    const next = value.includes(id) ? value.filter((v) => v !== id) : [...value, id];
    onChange(next);
    onValidChange?.(agreements.filter((a) => a.required).every((a) => next.includes(a.id)));
  };

  const toggleAll = () => {
    const allIds = agreements.map((a) => a.id);
    const allChecked = allIds.every((id) => value.includes(id));
    const next = allChecked ? [] : allIds;
    onChange(next);
    onValidChange?.(agreements.filter((a) => a.required).every((a) => next.includes(a.id)));
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const allChecked = agreements.every((a) => value.includes(a.id));
  const someChecked = agreements.some((a) => value.includes(a.id));

  return (
    <div className="border border-border rounded overflow-hidden">
      {/* 전체 동의 */}
      <div
        className={`flex items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors ${
          allChecked ? "bg-secondary" : "bg-muted/30"
        }`}
        onClick={toggleAll}
      >
        <Checkbox checked={allChecked} indeterminate={!allChecked && someChecked} />
        <span className="text-sm font-semibold text-foreground select-none">전체 동의</span>
        <span className="ml-auto text-xs text-muted-foreground">
          (선택 포함)
        </span>
      </div>

      <div className="divide-y divide-border border-t border-border">
        {agreements.map((agreement) => {
          const checked = value.includes(agreement.id);
          const open = expanded[agreement.id];

          return (
            <div key={agreement.id}>
              {/* 항목 행 */}
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="cursor-pointer" onClick={() => toggle(agreement.id)}>
                  <Checkbox checked={checked} />
                </div>
                <span
                  className="flex-1 text-sm text-foreground select-none cursor-pointer"
                  onClick={() => toggle(agreement.id)}
                >
                  {agreement.required && (
                    <span className="text-primary font-semibold mr-1">[필수]</span>
                  )}
                  {!agreement.required && (
                    <span className="text-muted-foreground mr-1">[선택]</span>
                  )}
                  {agreement.label}
                </span>

                {/* 내용 보기 버튼 */}
                {agreement.content && (
                  <button
                    type="button"
                    onClick={() => toggleExpand(agreement.id)}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    aria-label={open ? "접기" : "펼치기"}
                  >
                    {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                )}
                {agreement.href && (
                  <a
                    href={agreement.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>

              {/* 펼침 내용 */}
              {agreement.content && open && (
                <div className="px-4 pb-4">
                  <div className="bg-muted/40 rounded p-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-line max-h-36 overflow-y-auto">
                    {agreement.content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 체크박스 (커스텀) ────────────────────────────────────────────────────────

function Checkbox({ checked, indeterminate = false }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <div
      className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
        checked || indeterminate
          ? "bg-primary border-primary"
          : "bg-white border-border"
      }`}
    >
      {indeterminate && !checked && (
        <div className="w-2 h-0.5 bg-white rounded" />
      )}
      {checked && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}
