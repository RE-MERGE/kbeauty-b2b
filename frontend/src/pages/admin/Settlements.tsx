import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  Search, 
  Calendar, 
  Download,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react';

export default function Settlements() {
  // 상태 관리 (필터 탭 및 검색어)
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 가상 정산 데이터 샘플 (포트원 연동 및 정산 프로세스 반영)
  const [settlement, setSettlement] = useState([
    { id: 'ST-20260610-01', date: '2026.06.10', buyer: '(주)에이비씨코리아', partner: '김파트너 컴퍼니', amount: 5000000, fee: 500000, status: '대기' },
    { id: 'ST-20260609-12', date: '2026.06.09', buyer: '(주)글로벌디에프', partner: '이파트너 팩토리', amount: 2000000, fee: 200000, status: '완료' },
    { id: 'ST-20260608-05', date: '2026.06.08', buyer: '하이픈 무역', partner: '박파트너 무역', amount: 3500000, fee: 350000, status: '환불요청' },
    { id: 'ST-20260607-02', date: '2026.06.07', buyer: '(주)씨엠에스', partner: '최파트너 산업', amount: 1200000, fee: 120000, status: '완료' },
  ]);

  // 정산 승인 액션 함수
  const handleApprove = (id: string) => {
    if (window.confirm('해당 건의 정산 지급을 승인하시겠습니까?')) {
      setSettlement(prev => prev.map(item => item.id === id ? { ...item, status: '완료' } : item));
    }
  };

  // 환불 처리 액션 함수 (포트원 연동 시 환불 API 호출부)
  const handleRefund = (id: string) => {
    if (window.confirm('포트원을 통해 결제 취소(환불)를 진행하시겠습니까?')) {
      alert('환불 처리가 완료되었습니다.');
      setSettlement(prev => prev.filter(item => item.id !== id)); // 혹은 상태를 '환불완료'로 변경
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-foreground">
      {/* 페이지 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">결제 및 정산 관리</h1>
          <p className="text-sm text-muted-foreground mt-1">플랫폼 내 대금 결제 현황 및 공급사 정산 내역을 관리합니다.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-border px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
          <Download size={16} />
          엑셀 다운로드
        </button>
      </div>

      {/* 1. 상단 요약 메트릭 카드 영역 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start text-muted-foreground mb-2">
            <span className="text-sm font-medium">총 거래액 (GMV)</span>
            <TrendingUp size={18} className="text-blue-500" />
          </div>
          <div className="text-2xl font-bold">11,700,000원</div>
          <span className="text-xs text-green-600 font-medium">전월 대비 +12.4%</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start text-muted-foreground mb-2">
            <span className="text-sm font-medium">플랫폼 수수료 수익</span>
            <DollarSign size={18} className="text-green-500" />
          </div>
          <div className="text-2xl font-bold">1,170,000원</div>
          <span className="text-xs text-muted-foreground">평균 수수료율 10%</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start text-muted-foreground mb-2">
            <span className="text-sm font-medium">정산 대기 금액</span>
            <Clock size={18} className="text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-orange-600">4,500,000원</div>
          <span className="text-xs text-orange-600 font-medium">지급 승인 대기 1건</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-border shadow-sm">
          <div className="flex justify-between items-start text-muted-foreground mb-2">
            <span className="text-sm font-medium">환불 / 취소 요청</span>
            <AlertCircle size={18} className="text-red-500" />
          </div>
          <div className="text-2xl font-bold text-red-600">3,500,000원</div>
          <span className="text-xs text-red-600 font-medium">빠른 처리가 필요합니다.</span>
        </div>
      </div>

      {/* 2. 중단 필터 및 검색 바 */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-4 mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* 상태 필터 탭 */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          {[
            { id: 'all', label: '전체' },
            { id: '대기', label: '정산 대기' },
            { id: '완료', label: '정산 완료' },
            { id: '환불요청', label: '환불 요청' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex-1 md:flex-none ${
                activeTab === tab.id 
                  ? 'bg-white text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 검색 및 기간 설정 */}
        <div className="flex gap-2 w-full md:w-auto justify-end">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="바이어 또는 공급사 검색" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-border rounded-lg text-sm w-full focus:outline-none focus:border-primary"
            />
          </div>
          <button className="p-2 border border-border rounded-lg hover:bg-slate-50 text-muted-foreground">
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* 3. 하단 메인 데이터 테이블 */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-border text-muted-foreground font-medium">
                <th className="p-4">주문번호 / 일시</th>
                <th className="p-4">바이어(수요자)</th>
                <th className="p-4">공급사(파트너)</th>
                <th className="p-4 text-right">결제 금액</th>
                <th className="p-4 text-right">플랫폼 수수료</th>
                <th className="p-4 text-right">정산 예정액</th>
                <th className="p-4 text-center">상태</th>
                <th className="p-4 text-center">관리 액션</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settlement
                .filter(item => activeTab === 'all' || item.status === activeTab)
                .filter(item => item.buyer.includes(searchTerm) || item.partner.includes(searchTerm))
                .map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-mono text-xs">
                      <span className="font-semibold text-foreground block">{row.id}</span>
                      <span className="text-muted-foreground">{row.date}</span>
                    </td>
                    <td className="p-4 font-medium">{row.buyer}</td>
                    <td className="p-4 text-muted-foreground">{row.partner}</td>
                    <td className="p-4 text-right font-medium">{row.amount.toLocaleString()}원</td>
                    <td className="p-4 text-right text-slate-500">{row.fee.toLocaleString()}원</td>
                    <td className="p-4 text-right font-semibold text-primary">{(row.amount - row.fee).toLocaleString()}원</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                        row.status === '완료' ? 'bg-green-50 text-green-700' :
                        row.status === '대기' ? 'bg-orange-50 text-orange-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                        {row.status === '완료' && <CheckCircle2 size={12} />}
                        {row.status === '대기' && <Clock size={12} />}
                        {row.status === '환불요청' && <AlertCircle size={12} />}
                        정산 {row.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {row.status === '대기' && (
                        <button 
                          onClick={() => handleApprove(row.id)}
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors"
                        >
                          정산 승인
                        </button>
                      )}
                      {row.status === '완료' && (
                        <span className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                          <CheckCircle2 size={12} className="text-green-500" /> 지급 완료
                        </span>
                      )}
                      {row.status === '환불요청' && (
                        <button 
                          onClick={() => handleRefund(row.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded-md font-medium shadow-sm transition-colors flex items-center gap-1 mx-auto"
                        >
                          <RefreshCcw size={12} /> 환불 승인
                        </button>
                      )}
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 테이블 하단 페이지네이션 영역 */}
        <div className="p-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground bg-slate-50/50">
          <span>총 {settlement.length}건 중 1-{settlement.length}건 표시 중</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-border rounded bg-white disabled:opacity-50" disabled>이전</button>
            <button className="px-2 py-1 border border-primary rounded bg-blue-50 text-primary font-medium">1</button>
            <button className="px-2 py-1 border border-border rounded bg-white disabled:opacity-50" disabled>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
}