import React, { useState } from 'react';
import { 
  MessageSquare, 
  AlertTriangle, 
  Bell, 
  HelpCircle, 
  Search, 
  ChevronRight,
  CheckCircle,
  Clock
} from 'lucide-react';
import {Inquiry} from "@/pages/support/Inquiry";

interface CancelRequestRow {
  cancelId: number;       // 취소 요청 고유 ID
  orderNo: string;        // 주문 번호
  createdAt: string;      // 취소 요청 일시
  buyerId: string;        // 구매자 ID
  sellerCompanyName: string; // 판매 회사명
  cancelAmount: number;   // 환불/취소 금액
  reason: string;         // 취소 사유
  status: 'PENDING' | 'APPROVED' | 'REJECTED'; // 상태 (대기, 승인, 거절)
}

export default function SupportManagement() {
  const [activeMenu, setActiveMenu] = useState('inquiry'); // inquiry: 1:1문의, notice: 공지사항, faq: FAQ
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelRows, setCancelRows] = useState<CancelRequestRow[]>([]);

  return (
    // 💡 핵심: h-screen과 flex flex-col을 주어 전체 화면 높이를 완벽히 제어합니다.
    <div className="w-full h-screen bg-slate-50 text-foreground flex flex-col overflow-hidden">
      
      {/* 고정된 헤더 영역 (p-6 유지) */}
      <div className="p-6 pb-2 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">고객지원 및 운영 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">사용자 문의 응대 및 서비스 공지사항을 관리합니다.</p>
      </div>

      {/* 💡 메인 본문 영역: 수직으로 남은 화면을 꽉 채우고 내부 스크롤을 지원합니다. */}
      <div className="flex-1 p-6 pt-2 grid grid-cols-4 gap-6 min-h-0">
        
        {/* 좌측 사이드 메뉴 (하단까지 늘어나도록 h-full 및 flex 구조 적용) */}
        <div className="col-span-1 bg-white rounded-xl border border-border shadow-sm p-2 h-full flex flex-col gap-1">
          <button 
            onClick={() => setActiveMenu('inquiry')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'inquiry' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare size={18} />
            1:1 문의 관리
          </button>
          <button 
            onClick={() => setActiveMenu('notice')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'notice' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <Bell size={18} />
            공지사항 등록/관리
          </button>
          <button 
            onClick={() => setActiveMenu('faq')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'faq' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <HelpCircle size={18} />
            자주 묻는 질문 (FAQ)
          </button>
          <button
              onClick={() => setActiveMenu('paymentcancel')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeMenu === 'paymentcancel' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
          >
            <MessageSquare size={18} />
            환불/취소 관리
          </button>
        </div>

        {/* 우측 컨텐츠 박스 (내용이 없어도 하단 바닥까지 하얗게 꽉 찹니다) */}
        <div className="col-span-3 bg-white rounded-xl border border-border shadow-sm flex flex-col h-full overflow-hidden">
          {/* 리스트 헤더 */}
          <div className="p-4 border-b border-border flex justify-between items-center bg-slate-50/50 shrink-0">
            <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <input 
                type="text" 
                placeholder="제목 또는 작성자 검색" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-1.5 border border-border rounded-lg text-sm w-full focus:outline-none focus:border-blue-500 bg-white"
              />
            </div>
          </div>

          {/* 리스트 본문 (flex-1과 overflow-y-auto를 주어 리스트가 많아져도 이 안에서만 스크롤됩니다) */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {activeMenu === 'inquiry' && <Inquiry embedded />}

            {activeMenu === 'notice' && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                📢 등록된 공지사항 목록이 이곳에 노출됩니다.
              </div>
            )}

            {activeMenu === 'faq' && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                💡 자주 묻는 질문 리스트 관리 화면이 노출됩니다.
              </div>
            )}

            {activeMenu === 'paymentcancel' && (
                <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">환불 및 취소 요청 내역</h3>
                    <p className="text-sm text-gray-500">고객 및 파트너사가 요청한 취소 건을 관리합니다.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                      <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="p-4 font-medium">주문 번호</th>
                        <th className="p-4 font-medium">요청 일시</th>
                        <th className="p-4 font-medium">구매자 ID</th>
                        <th className="p-4 font-medium">판매 업체</th>
                        <th className="p-4 font-medium">환불 금액</th>
                        <th className="p-4 font-medium">취소 사유</th>
                        <th className="p-4 font-medium">처리 상태</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">

                      {cancelRows && cancelRows.length > 0 ? (
                          cancelRows.map((row) => (
                              <tr key={row.cancelId} className="hover:bg-gray-50 transition-colors">
                                <td className="p-4 font-medium text-gray-900">{row.orderNo}</td>
                                <td className="p-4">{row.createdAt}</td>
                                <td className="p-4">{row.buyerId}</td>
                                <td className="p-4">{row.sellerCompanyName}</td>
                                <td className="p-4 text-red-600 font-semibold">
                                  -{row.cancelAmount.toLocaleString()}원
                                </td>
                                <td className="p-4 max-w-xs truncate" title={row.reason}>
                                  {row.reason}
                                </td>
                                <td className="p-4">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      row.status === 'APPROVED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          row.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                              'bg-yellow-50 text-yellow-800 ring-yellow-600/20'
                  }`}>
                    {row.status === 'APPROVED' && '승인 완료'}
                    {row.status === 'REJECTED' && '요청 거절'}
                    {row.status === 'PENDING' && '승인 대기'}
                  </span>
                                </td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan={7} className="p-8 text-center text-gray-400">
                              조회된 환불 및 취소 요청 내역이 없습니다.
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                  </div>
                </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}