import React, { useState, useRef } from "react";
import {
  Plus, Pencil, Trash2, X, Camera, Upload,
  Layers, CheckCircle, AlertCircle, ImageOff,
} from "lucide-react";
import type { Brand, BrandForm } from "./types";
import { PanelCard, Toast, inputCls } from "./shared";

// ── Mock data (DB: brands 테이블) ─────────────────────────────────────────────

const MOCK_BRANDS: Brand[] = [
  {
    brand_id: 1, company_id: 1,
    brand_name: "르솔레이유",
    brand_logo_url: null,
    created_at: "2024.01.15", updated_at: "2024.01.15",
  },
  {
    brand_id: 2, company_id: 1,
    brand_name: "모아패션",
    brand_logo_url: null,
    created_at: "2024.03.02", updated_at: "2024.06.10",
  },
];

const EMPTY_FORM: BrandForm = { brand_name: "", brand_logo_url: null, logoFile: null };

// ── Logo preview helper ───────────────────────────────────────────────────────

function LogoCircle({
  url, name, size = "lg", onClick,
}: {
  url: string | null; name: string; size?: "sm" | "lg"; onClick?: () => void;
}) {
  const initials = name.trim().slice(0, 2) || "BR";
  const dim = size === "lg" ? "w-16 h-16 text-lg" : "w-9 h-9 text-xs";

  return (
    <div
      onClick={onClick}
      className={`${dim} rounded-2xl flex items-center justify-center shrink-0 font-bold overflow-hidden
        ${onClick ? "cursor-pointer" : ""}
        ${url ? "" : "bg-primary/10 text-primary"}`}
    >
      {url
        ? <img src={url} alt={name} className="w-full h-full object-cover" />
        : initials}
    </div>
  );
}

// ── BrandFormPanel (add / edit inline) ───────────────────────────────────────

function BrandFormPanel({
  initial,
  onSave,
  onCancel,
}: {
  initial?: { brand_name: string; brand_logo_url: string | null };
  onSave: (form: BrandForm) => void;
  onCancel: () => void;
}) {
  const [form, setForm]           = useState<BrandForm>({
    brand_name:    initial?.brand_name    ?? "",
    brand_logo_url: initial?.brand_logo_url ?? null,
    logoFile:      null,
  });
  const [preview, setPreview]     = useState<string | null>(initial?.brand_logo_url ?? null);
  const fileRef                   = useRef<HTMLInputElement>(null);

  const set = (p: Partial<BrandForm>) => setForm((f) => ({ ...f, ...p }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set({ logoFile: file });
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setPreview(null);
    set({ logoFile: null, brand_logo_url: null });
    if (fileRef.current) fileRef.current.value = "";
  };

  const isValid = form.brand_name.trim().length > 0;

  return (
    <div className="border border-primary/25 bg-primary/[0.03] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-primary" />
          <span className="text-sm font-semibold">{initial ? "브랜드 수정" : "새 브랜드 추가"}</span>
        </div>
        <button
          onClick={onCancel}
          className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex gap-5">
        {/* Logo upload area */}
        <div className="shrink-0 flex flex-col items-center gap-2">
          <div className="relative group">
            <div
              onClick={() => fileRef.current?.click()}
              className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
            >
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                : <span className="text-xl font-black text-primary/30">
                    {form.brand_name.trim().slice(0, 2) || "BR"}
                  </span>}
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
          {preview && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="text-[11px] text-red-500 hover:text-red-700 flex items-center gap-0.5 transition-colors"
            >
              <X size={10} /> 로고 제거
            </button>
          )}
          <p className="text-[10px] text-muted-foreground text-center leading-tight">
            JPG · PNG<br />최대 2MB
          </p>
        </div>

        {/* Fields */}
        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">
              브랜드명 <span className="text-primary text-[11px] font-normal opacity-70">(필수)</span>
            </label>
            <input
              type="text"
              value={form.brand_name}
              onChange={(e) => set({ brand_name: e.target.value })}
              placeholder="브랜드명 입력"
              maxLength={100}
              className={inputCls}
              autoFocus
            />
            <p className="text-[11px] text-muted-foreground text-right">{form.brand_name.length} / 100</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-foreground">브랜드 로고 URL</label>
            <input
              type="url"
              value={form.brand_logo_url ?? ""}
              onChange={(e) => {
                set({ brand_logo_url: e.target.value || null });
                if (!form.logoFile) setPreview(e.target.value || null);
              }}
              placeholder="https://cdn.example.com/logo.png (선택)"
              className={inputCls}
            />
            <p className="text-[11px] text-muted-foreground">
              파일 업로드와 URL 중 하나만 사용하세요. 파일 업로드가 우선 적용됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-5">
        <button
          onClick={onCancel}
          className="flex-1 py-2.5 border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white"
        >
          취소
        </button>
        <button
          onClick={() => isValid && onSave(form)}
          disabled={!isValid}
          className="flex-1 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
        >
          {initial ? "수정 완료" : "브랜드 추가"}
        </button>
      </div>
    </div>
  );
}

// ── BrandCard ─────────────────────────────────────────────────────────────────

function BrandCard({
  brand,
  onEdit,
  onDelete,
}: {
  brand: Brand;
  onEdit: (b: Brand) => void;
  onDelete: (id: number) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="bg-white border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/30 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <LogoCircle url={brand.brand_logo_url} name={brand.brand_name} size="sm" />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">{brand.brand_name}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {brand.brand_logo_url ? (
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle size={10} /> 로고 등록됨
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-muted-foreground/60">
                  <ImageOff size={10} /> 로고 없음
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-0.5 shrink-0">
          <button
            onClick={() => { setConfirmDelete(false); onEdit(brand); }}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/5 transition-colors"
            title="수정"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
            title="삭제"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Logo preview (if exists) */}
      {brand.brand_logo_url && (
        <div className="rounded-lg border border-border overflow-hidden bg-muted/20 flex items-center justify-center h-24">
          <img
            src={brand.brand_logo_url}
            alt={brand.brand_name}
            className="max-h-full max-w-full object-contain p-2"
          />
        </div>
      )}

      {/* Meta */}
      <div className="text-[11px] text-muted-foreground/60 border-t border-border/60 pt-2.5 flex justify-between">
        <span>등록 {brand.created_at}</span>
        {brand.updated_at !== brand.created_at && <span>수정 {brand.updated_at}</span>}
      </div>

      {/* Delete confirm inline */}
      {confirmDelete && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-3 flex flex-col gap-2">
          <p className="text-xs font-semibold text-red-700 flex items-center gap-1.5">
            <AlertCircle size={12} /> 브랜드를 삭제할까요?
          </p>
          <p className="text-[11px] text-red-600">삭제 후 복구할 수 없습니다.</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setConfirmDelete(false)}
              className="flex-1 py-1.5 text-[11px] font-semibold border border-border rounded-md bg-white text-muted-foreground hover:text-foreground transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => onDelete(brand.brand_id)}
              className="flex-1 py-1.5 text-[11px] font-semibold bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
            >
              삭제 확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BrandsTab (main export) ───────────────────────────────────────────────────

type FormMode = null | "new" | Brand;

export function BrandsTab() {
  const [brands, setBrands]     = useState<Brand[]>(MOCK_BRANDS);
  const [formMode, setFormMode] = useState<FormMode>(null);
  const [toast, setToast]       = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = (form: BrandForm) => {
    const now = new Date().toLocaleDateString("ko-KR", {
      year: "numeric", month: "2-digit", day: "2-digit",
    }).replace(/\. /g, ".").replace(/\.$/, "");

    // 파일 업로드 시 실제로는 presigned URL → S3 업로드 후 URL 저장
    // 여기서는 파일이 있으면 URL은 무시 (mock)
    const resolvedLogoUrl = form.logoFile
      ? URL.createObjectURL(form.logoFile)   // mock: 실제론 업로드 URL
      : form.brand_logo_url;

    if (formMode === "new") {
      const next: Brand = {
        brand_id:      Date.now(),
        company_id:    1,
        brand_name:    form.brand_name.trim(),
        brand_logo_url: resolvedLogoUrl,
        created_at:    now,
        updated_at:    now,
      };
      setBrands((p) => [...p, next]);
      showToast(`'${next.brand_name}' 브랜드를 추가했습니다.`);
    } else if (formMode /*&& formMode !== "new"*/) {
      setBrands((p) =>
        p.map((b) =>
          b.brand_id === (formMode as Brand).brand_id
            ? { ...b, brand_name: form.brand_name.trim(), brand_logo_url: resolvedLogoUrl, updated_at: now }
            : b,
        ),
      );
      showToast(`'${form.brand_name.trim()}' 브랜드를 수정했습니다.`);
    }

    setFormMode(null);
  };

  const handleDelete = (id: number) => {
    const target = brands.find((b) => b.brand_id === id);
    setBrands((p) => p.filter((b) => b.brand_id !== id));
    showToast(`'${target?.brand_name}' 브랜드를 삭제했습니다.`);
  };

  const editInitial = formMode && formMode !== "new"
    ? { brand_name: (formMode as Brand).brand_name, brand_logo_url: (formMode as Brand).brand_logo_url }
    : undefined;

  return (
    <div className="space-y-4">
      {/* Topbar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          회사가 보유한 브랜드를 등록하고 로고를 관리하세요.
        </p>
        <button
          onClick={() => setFormMode("new")}
          disabled={formMode !== null}
          className="flex items-center gap-1.5 bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-white px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={13} /> 브랜드 추가
        </button>
      </div>

      {/* Stat */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-border rounded-xl px-4 py-3.5">
          <p className="text-2xl font-black text-foreground">{brands.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">등록된 브랜드</p>
        </div>
        <div className="bg-white border border-border rounded-xl px-4 py-3.5">
          <p className="text-2xl font-black text-emerald-600">
            {brands.filter((b) => b.brand_logo_url).length}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">로고 등록 완료</p>
        </div>
      </div>

      {/* Inline form */}
      {formMode !== null && (
        <BrandFormPanel
          initial={editInitial}
          onSave={handleSave}
          onCancel={() => setFormMode(null)}
        />
      )}

      {/* Brand grid */}
      {brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-xl">
          <Layers size={28} className="text-muted-foreground/20 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">등록된 브랜드가 없습니다.</p>
          <p className="text-xs text-muted-foreground mt-1">
            브랜드 추가 버튼을 눌러 첫 번째 브랜드를 등록하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {brands.map((brand) => (
            <BrandCard
              key={brand.brand_id}
              brand={brand}
              onEdit={(b) => setFormMode(b)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Upload guide */}
      <PanelCard title="브랜드 로고 가이드" icon={<Upload size={13} />}>
        <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1">
            <p className="font-semibold text-foreground">권장 포맷</p>
            <p>PNG (투명 배경) 또는 SVG</p>
            <p>JPG도 지원하나 투명 배경 불가</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">권장 크기</p>
            <p>400 × 400px 이상</p>
            <p>정사각형 비율 (1:1) 권장</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">용량 제한</p>
            <p>파일당 최대 2MB</p>
            <p>CDN 업로드 후 URL 저장</p>
          </div>
        </div>
      </PanelCard>

      {toast && <Toast message={toast} />}
    </div>
  );
}
