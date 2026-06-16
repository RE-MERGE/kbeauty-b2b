/**
 * CompanySettings — 진입점 (레이아웃 + 사이드바)
 *
 * 탭별 파일 구조:
 *   types.ts          — 공유 타입 정의
 *   shared.tsx        — 공유 상수 / Mock / UI 프리미티브
 *   MembersTab.tsx    — 직원 관리
 *   AddressesTab.tsx  — 주소 관리
 *   BrandsTab.tsx     — 브랜드 관리
 *   CompanyTab.tsx    — 회사 정보
 *   BankAcoountTab.tsx— 계좌 정보
 */
import { useState } from "react";
import {
  Settings, Bell, ChevronRight,
  ShieldCheck, Layers,
} from "lucide-react";
import type { ActiveTab } from "./types";
import { SIDEBAR_NAV } from "./shared";
import { BankAccountTab } from "./BankAccountTab";
import { CompanyTab }   from "./CompanyTab";
import { MembersTab }  from "./MembersTab";
import { BrandsTab }   from "./BrandsTab";
import { AddressesTab } from "./AddressesTab";


// ── Main ──────────────────────────────────────────────────────────────────────

export function CompanySettings() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("members");

  const now = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
  });

  const currentNav = SIDEBAR_NAV.find((n) => n.key === activeTab)!;

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">

      {/* ── ERP 2-column layout ───────────────────────────────────────────── */}
      <div className="flex gap-6 items-start">

        {/* ── 사이드바 ── */}
        <aside className="w-56 shrink-0">
          <nav className="bg-white border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/[0.03]">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                설정 메뉴
              </p>
            </div>

            <div className="p-2">
              {SIDEBAR_NAV.map((item) => {
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-start gap-3 px-3 py-3 rounded-lg text-left transition-all mb-0.5 last:mb-0 group ${
                      active
                        ? "bg-primary text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <span className={`mt-0.5 shrink-0 ${active ? "text-white" : "text-muted-foreground group-hover:text-foreground"}`}>
                      {item.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-semibold leading-tight ${active ? "text-white" : ""}`}>
                        {item.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 leading-tight ${active ? "text-white/60" : "text-muted-foreground/60"}`}>
                        {item.desc}
                      </p>
                    </div>
                    {active && <ChevronRight size={14} className="ml-auto mt-0.5 text-white/70 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* 회사 스니펫 */}
            <div className="mx-2 mb-2 p-3 rounded-lg bg-muted/30 border border-border/60">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                  <Layers size={11} className="text-primary" />
                </div>
                <span className="text-xs font-semibold text-foreground truncate">(주)패션코리아</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md inline-flex items-center gap-0.5">
                <ShieldCheck size={9} /> 셀러 승인
              </span>
            </div>
          </nav>
        </aside>

        {/* ── 콘텐츠 영역 ── */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
            <span>회사 관리</span>
            <ChevronRight size={11} />
            <span className="text-foreground font-medium">{currentNav.label}</span>
          </div>

          {activeTab === "company"   && <CompanyTab />}
          {activeTab === "members"   && <MembersTab />}
          {activeTab === "brands"    && <BrandsTab />}
          {activeTab === "addresses" && <AddressesTab />}
          {activeTab === "bank"      && <BankAccountTab />}
        </main>
      </div>
    </div>
  );
}
