import { useState, useEffect } from "react";
import { DollarSign, ArrowUp, TrendingUp, Download, Search, Calendar } from "lucide-react";
import { settlementApi } from "./Settlement"; // 💡 실제 프로젝트 경로에 맞게 조정 필요

// ==========================================================
// 💡 [타입 정의] 백엔드 SettlementDashboard DTO 사양과 일치화
//    (Admin.tsx / Settlements.tsx와 동일한 구조)
// ==========================================================
interface Summary {
  totalGMV: number;
  totalFee: number;
  pendingAmount: number;
  refundRequestAmount: number;
}

interface SettlementRow {
  settlementId?: number;
  orderNo?: string;
  createdAt?: string;
  buyerId?: string;
  sellerId?: string;
  sellerCompanyName?: string;
  totalAmount: number;
  platformFee: number;
  finalAmount: number;
  status: string;
  receiverName?: string;
}

interface MonthlyStat {
  month: string;
  total: number;
  count: number;
  avgOrder: number;
}

export function AdminAnalytics() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("전체");
  const [selectedPeriod, setSelectedPeriod] = useState("3months");
  const [loading, setLoading] = useState<boolean>(true);

  const [summary, setSummary] = useState<Summary>({
    totalGMV: 0,
    totalFee: 0,
    pendingAmount: 0,
    refundRequestAmount: 0,
  });
  const [rows, setRows] = useState<SettlementRow[]>([]);
  const [paymentStats, setPaymentStats] = useState<MonthlyStat[]>([]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await settlementApi.getSettlements();

      if (data) {
        if (data.summary) setSummary(data.summary);
        if (Array.isArray(data.rows)) setRows(data.rows);
        if (Array.isArray(data.paymentStats)) setPaymentStats(data.paymentStats);
      }
    } catch (error) {
      console.error("분석 데이터 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const safeRows = Array.isArray(rows) ? rows : [];

  const filtered = safeRows.filter((p) => {
    const matchStatus = statusFilter === "전체" || p.status === statusFilter;
    const keyword = search.toLowerCase();
    const matchSearch =
        !search ||
        (p.orderNo ?? "").toLowerCase().includes(keyword) ||
        (p.receiverName ?? "").includes(search) ||
        (p.sellerCompanyName ?? "").includes(search);
    return matchStatus && matchSearch;
  });

  const totalRevenue = filtered
      .filter((p) => p.status === "COMPLETED")
      .reduce((a, p) => a + (p.totalAmount ?? 0), 0);
  const totalFee = filtered
      .filter((p) => p.status === "COMPLETED")
      .reduce((a, p) => a + (p.platformFee ?? 0), 0);
  const totalCount = filtered.filter((p) => p.status === "COMPLETED").length;

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-sm font-medium text-muted-foreground animate-pulse">분석 데이터 불러오는 중...</div>
        </div>
    );
  }

  return (
      <div className="max-w-[1280px] mx-auto px-4 py-8 font-[Inter,sans-serif]">
        {/* KPI Cards (백엔드 summary 실시간 반영) */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-border rounded-lg p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">총 거래액 (GMV)</div>
            <div className="text-2xl font-bold text-foreground font-mono">₩{summary.totalGMV.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1"><ArrowUp size={11} />완료 건 기준</div>
          </div>
          <div className="bg-white border border-border rounded-lg p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">플랫폼 수수료 수익</div>
            <div className="text-2xl font-bold text-foreground font-mono">₩{(summary.totalGMV/10).toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1"><TrendingUp size={11} />누적 수수료</div>
          </div>
          <div className="bg-white border border-border rounded-lg p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">완료 거래 건수</div>
            <div className="text-2xl font-bold text-foreground font-mono">{totalCount}</div>
            <div className="text-xs text-muted-foreground mt-1">/{filtered.length}건 중</div>
          </div>
          <div className="bg-white border border-border rounded-lg p-5">
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">평균 거래액</div>
            <div className="text-2xl font-bold text-foreground font-mono">
              ₩{totalCount > 0 ? Math.floor(totalRevenue / totalCount).toLocaleString() : "—"}
            </div>
            <div className="text-xs text-muted-foreground mt-1">완료 건 기준</div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_320px] gap-6 mb-6">
          {/* Payment Table */}
          <div className="bg-white border border-border rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-4 flex-wrap">
              <h2 className="font-bold text-foreground flex items-center gap-2">
                <DollarSign size={18} className="text-primary" /> 거래 내역
              </h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-border rounded px-3 py-1.5 gap-2">
                  <Search size={13} className="text-muted-foreground" />
                  <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="검색..."
                      className="text-xs outline-none w-32"
                  />
                </div>
                <div className="flex gap-1">
                  {["전체", "COMPLETED", "PENDING", "REFUNDED"].map((s) => (
                      <button
                          key={s}
                          onClick={() => setStatusFilter(s)}
                          className={`px-2.5 py-1 text-xs rounded border transition-colors ${
                              statusFilter === s ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                          }`}
                      >
                        {s === "전체" ? "전체" : s === "COMPLETED" ? "완료" : s === "PENDING" ? "대기" : "환불"}
                      </button>
                  ))}
                </div>
                <button className="border border-border text-muted-foreground hover:border-primary hover:text-primary px-3 py-1.5 rounded text-xs flex items-center gap-1 transition-colors">
                  <Download size={12} /> 내보내기
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                <tr className="bg-muted text-muted-foreground text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left font-medium">주문번호</th>
                  <th className="px-3 py-3 text-left font-medium">날짜</th>
                  <th className="px-3 py-3 text-left font-medium">바이어</th>
                  <th className="px-3 py-3 text-left font-medium">셀러</th>
                  <th className="px-3 py-3 text-right font-medium">거래액</th>
                  <th className="px-3 py-3 text-right font-medium">수수료</th>
                  <th className="px-3 py-3 text-center font-medium">상태</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map((p, index) => (
                    <tr key={p.settlementId ?? index} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-foreground">{p.orderNo ?? "-"}</td>
                      <td className="px-3 py-3 text-muted-foreground text-xs font-mono">
                        {p.createdAt ? p.createdAt.substring(0, 10) : "-"}
                      </td>
                      <td className="px-3 py-3 text-foreground text-xs">{p.receiverName ?? "-"}</td>
                      <td className="px-3 py-3 text-foreground text-xs">{p.sellerCompanyName ?? "-"}</td>
                      <td className="px-3 py-3 text-right font-mono font-bold text-foreground">
                        ₩{(p.totalAmount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-right font-mono text-xs text-green-600">
                        ₩{(p.platformFee ?? 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          p.status === "COMPLETED" ? "bg-green-50 text-green-700 border border-green-200" :
                              p.status === "PENDING" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                                  "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                        {p.status === "COMPLETED" ? "완료" : p.status === "PENDING" ? "대기" : "환불"}
                      </span>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-30" />
                  해당 조건의 거래 내역이 없습니다.
                </div>
            )}
          </div>

          {/* Monthly Stats */}
          <div className="space-y-4">
            <div className="bg-white border border-border rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-bold text-foreground flex items-center gap-2">
                  <Calendar size={18} className="text-primary" /> 월별 거래 통계
                </h2>
                <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="text-xs border border-border rounded px-2 py-1 outline-none"
                >
                  <option value="3months">최근 3개월</option>
                  <option value="6months">최근 6개월</option>
                </select>
              </div>
              <div className="p-5 space-y-4">
                {paymentStats.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">통계 데이터가 없습니다.</div>
                )}
                {paymentStats.map((stat) => {
                  const estimatedFee = Math.floor(stat.total / 10); // 💡 월별 수수료 필드가 없어 총액의 10%로 추정
                  const maxTotal = Math.max(...paymentStats.map((s) => s.total), 1);
                  return (
                      <div key={stat.month}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-mono text-muted-foreground">{stat.month}</span>
                          <span className="text-sm font-bold font-mono text-foreground">₩{stat.total.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${(stat.total / maxTotal) * 100}%` }} />
                        </div>
                        <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                          <span>{stat.count}건</span>
                          <span className="text-green-600">수수료(추정) ₩{estimatedFee.toLocaleString()}</span>
                        </div>
                      </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}