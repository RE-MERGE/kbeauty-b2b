import { useState } from "react";
import { Heart, Clock, Trash2, ShoppingCart, ExternalLink, Package, Search } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
    productId: number;
    productCode: string;
    name: string;
    brand: string | null;
    category: string;
    price: number;
    moq: number;
    moqUnit: string;
    imageUrl: string | null;
    sellerName: string;
    isActive: boolean;
    // wishlist-only
    savedAt?: string;
    // recent-only
    viewedAt?: string;
}

type SortKey = "recent" | "price-asc" | "price-desc";
type InnerTab = "wishlist" | "recent";

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_WISHLIST: Product[] = [
    {
        productId: 1, productCode: "F001",
        name: "베이직 오버핏 티셔츠", brand: "Basic",
        category: "티셔츠", price: 4800, moq: 50, moqUnit: "벌",
        imageUrl: null, sellerName: "(주)패션코리아", isActive: true,
        savedAt: "2026.06.12",
    },
    {
        productId: 2, productCode: "F022",
        name: "린넨 와이드 슬랙스", brand: null,
        category: "슬랙스", price: 12500, moq: 30, moqUnit: "벌",
        imageUrl: null, sellerName: "동대문의류㈜", isActive: true,
        savedAt: "2026.06.10",
    },
    {
        productId: 3, productCode: "F088",
        name: "울 혼방 롱코트", brand: "Studio F",
        category: "코트", price: 38000, moq: 20, moqUnit: "벌",
        imageUrl: null, sellerName: "FW스튜디오", isActive: false,
        savedAt: "2026.05.30",
    },
    {
        productId: 4, productCode: "F104",
        name: "데님 자켓 5색 구성", brand: null,
        category: "자켓", price: 21000, moq: 40, moqUnit: "벌",
        imageUrl: null, sellerName: "(주)진스타일", isActive: true,
        savedAt: "2026.05.25",
    },
];

const MOCK_RECENT: Product[] = [
    {
        productId: 5, productCode: "F201",
        name: "폴로 카라 니트 (3색)", brand: null,
        category: "니트/스웨터", price: 16000, moq: 30, moqUnit: "벌",
        imageUrl: null, sellerName: "니트하우스", isActive: true,
        viewedAt: "방금 전",
    },
    {
        productId: 1, productCode: "F001",
        name: "베이직 오버핏 티셔츠", brand: "Basic",
        category: "티셔츠", price: 4800, moq: 50, moqUnit: "벌",
        imageUrl: null, sellerName: "(주)패션코리아", isActive: true,
        viewedAt: "1시간 전",
    },
    {
        productId: 6, productCode: "F055",
        name: "스트라이프 셔츠 블라우스", brand: null,
        category: "셔츠/블라우스", price: 9800, moq: 60, moqUnit: "벌",
        imageUrl: null, sellerName: "블라우스팩토리", isActive: true,
        viewedAt: "어제",
    },
    {
        productId: 7, productCode: "F300",
        name: "레깅스 세트 (상하의)", brand: "Active",
        category: "레깅스", price: 13500, moq: 30, moqUnit: "세트",
        imageUrl: null, sellerName: "스포츠웨어", isActive: true,
        viewedAt: "2일 전",
    },
    {
        productId: 8, productCode: "F410",
        name: "캐주얼 후드 집업 (4색)", brand: null,
        category: "후드/맨투맨", price: 18000, moq: 25, moqUnit: "벌",
        imageUrl: null, sellerName: "캐주얼하우스", isActive: false,
        viewedAt: "3일 전",
    },
];

// ── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({
                         product,
                         showWishlistControls = false,
                         onRemove,
                     }: {
    product: Product;
    showWishlistControls?: boolean;
    onRemove?: (id: number) => void;
}) {
    const initials = product.name.slice(0, 2);

    return (
        <div className={`border border-border rounded-xl overflow-hidden group transition-colors hover:border-primary/30 ${
            !product.isActive ? "opacity-60" : ""
        }`}>
            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-muted/30 flex items-center justify-center relative">
                {product.imageUrl ? (
                    <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-1.5">
                        <Package size={22} className="text-muted-foreground/30" />
                        <span className="text-[10px] font-bold text-muted-foreground/40">{product.productCode}</span>
                    </div>
                )}

                {!product.isActive && (
                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground bg-white/90 px-2 py-1 rounded">
              판매 중단
            </span>
                    </div>
                )}

                {/* Remove (wishlist) */}
                {showWishlistControls && onRemove && (
                    <button
                        onClick={(e) => { e.preventDefault(); onRemove(product.productId); }}
                        className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-opacity opacity-0 group-hover:opacity-100"
                    >
                        <Heart size={13} className="text-red-400 fill-red-400" />
                    </button>
                )}
            </div>

            {/* Info */}
            <div className="p-3">
                <p className="text-[10px] text-muted-foreground mb-0.5">{product.sellerName}</p>
                <p className="text-sm font-semibold text-foreground truncate leading-snug">{product.name}</p>
                {product.brand && (
                    <p className="text-[11px] text-muted-foreground">{product.brand}</p>
                )}

                <div className="mt-2 flex items-end justify-between">
                    <div>
                        <p className="text-base font-black text-foreground">
                            {product.price.toLocaleString()}
                            <span className="text-xs font-normal text-muted-foreground ml-0.5">원</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                            MOQ {product.moq.toLocaleString()}{product.moqUnit}~
                        </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-mono">{product.productCode}</span>
                </div>

                {/* Actions */}
                <div className="mt-3 flex gap-1.5">
                    <a
                        href={`/products/${product.productId}`}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 border border-border rounded-lg text-xs font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                        <ExternalLink size={11} /> 보기
                    </a>
                    {product.isActive && (
                        <button className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-lg text-xs font-semibold text-primary transition-colors">
                            <ShoppingCart size={11} /> 담기
                        </button>
                    )}
                    {showWishlistControls && onRemove && (
                        <button
                            onClick={() => onRemove(product.productId)}
                            className="w-8 flex items-center justify-center py-1.5 border border-border rounded-lg text-muted-foreground hover:border-red-200 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={11} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Wishlist Panel ────────────────────────────────────────────────────────────

function WishlistPanel() {
    const [items, setItems]   = useState<Product[]>(MOCK_WISHLIST);
    const [sort, setSort]     = useState<SortKey>("recent");
    const [search, setSearch] = useState("");

    const remove = (id: number) => setItems((prev) => prev.filter((p) => p.productId !== id));

    const sorted = [...items]
        .filter((p) => {
            const q = search.trim().toLowerCase();
            return !q || p.name.toLowerCase().includes(q) || p.sellerName.toLowerCase().includes(q);
        })
        .sort((a, b) => {
            if (sort === "price-asc")  return a.price - b.price;
            if (sort === "price-desc") return b.price - a.price;
            return 0; // "recent" = insertion order
        });

    return (
        <div className="space-y-4">
            {/* Controls */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-xs">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="상품명 검색"
                        className="w-full pl-8 pr-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                    />
                </div>
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-white"
                >
                    <option value="recent">최근 저장순</option>
                    <option value="price-asc">가격 낮은순</option>
                    <option value="price-desc">가격 높은순</option>
                </select>
            </div>

            <p className="text-xs text-muted-foreground">
                관심 상품 <strong className="text-foreground">{items.length}개</strong>
                {items.filter((p) => !p.isActive).length > 0 && (
                    <span className="ml-2 text-red-400">
            (판매 중단 {items.filter((p) => !p.isActive).length}개)
          </span>
                )}
            </p>

            {sorted.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-center">
                    <Heart size={28} className="text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">관심 상품이 없습니다.</p>
                    <p className="text-xs text-muted-foreground mt-1">상품 페이지에서 하트를 눌러 저장하세요.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {sorted.map((p) => (
                        <ProductCard
                            key={p.productId}
                            product={p}
                            showWishlistControls
                            onRemove={remove}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Recent Panel ──────────────────────────────────────────────────────────────

function RecentPanel() {
    const [items, setItems] = useState<Product[]>(MOCK_RECENT);

    const remove = (id: number) => setItems((prev) => prev.filter((p) => p.productId !== id));
    const clearAll = () => setItems([]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                    최근 본 상품 <strong className="text-foreground">{items.length}개</strong>
                    <span className="ml-1">(최근 30일)</span>
                </p>
                {items.length > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs text-muted-foreground hover:text-red-500 flex items-center gap-1 transition-colors"
                    >
                        <Trash2 size={11} /> 전체 삭제
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-xl text-center">
                    <Clock size={28} className="text-muted-foreground/20 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">최근 본 상품이 없습니다.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {items.map((p) => (
                        <div key={p.productId} className="relative">
                            {p.viewedAt && (
                                <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Clock size={9} /> {p.viewedAt}
                                </div>
                            )}
                            <ProductCard
                                product={p}
                                onRemove={remove}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function ProductActivityTab() {
    const [inner, setInner] = useState<InnerTab>("wishlist");

    const tabs: { id: InnerTab; label: string; icon: React.ReactNode; count: number }[] = [
        { id: "wishlist", label: "관심 상품", icon: <Heart size={14} />, count: MOCK_WISHLIST.length },
        { id: "recent",   label: "최근 본 상품", icon: <Clock size={14} />, count: MOCK_RECENT.length },
    ];

    return (
        <div className="space-y-5">
            <h2 className="flex items-center gap-2 text-base font-bold text-foreground">
                <Heart size={16} className="text-primary" /> 관심 · 최근 상품
            </h2>

            {/* Inner tab bar */}
            <div className="flex border-b border-border">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setInner(t.id)}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                            inner === t.id
                                ? "border-primary text-primary"
                                : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        {t.icon}
                        {t.label}
                        <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ml-0.5 ${
                            inner === t.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        }`}>
              {t.count}
            </span>
                    </button>
                ))}
            </div>

            {inner === "wishlist" && <WishlistPanel />}
            {inner === "recent"   && <RecentPanel />}
        </div>
    );
}