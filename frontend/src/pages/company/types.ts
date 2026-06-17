// ── Types ─────────────────────────────────────────────────────────────────────

export type Role         = "president" | "employee";
export type MemberStatus = "active" | "pending" | "inactive";
export type SellerStatus = "NONE" | "PENDING" | "APPROVED" | "REJECTED";
export type ActiveTab    = "members" | "addresses" | "company" | "brands" | "bank";
export type FilterTab    = "all" | "active" | "pending" | "inactive";
export type DefaultType  = "return" | "shipping" | "receiving";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: MemberStatus;
  last_login_at: string | null;
  joinedAt: string;
}

export interface Address {
  addressId: number;
  companyId: number;
  addressName: string;
  zipcode: string;
  address: string;
  addressDetail: string;
  createdAt: string;
  deletedAt: string | null;
}

export interface CompanyDefaults {
  returnAddressId: number | null;
}

export interface UserDefaults {
  shippingAddressId: number | null;
  receivingAddressId: number | null;
}

export interface CompanyForm {
  name: string;
  logoFile: File | null;
  logo_url: string | null;
  business_license_url: string | null;
  businessLicenseFile: File | null;
  representative_name: string;
  address: string;
  address_detail: string;
  website_url: string;
  description: string;
}

/** DB: brands 테이블 */
export interface Brand {
  brand_id: number;
  company_id: number;
  brand_name: string;
  brand_logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BrandForm {
  brand_name: string;
  brand_logo_url: string | null;
  logoFile: File | null;
}

export interface AddressFormData {
  addressName: string;
  zipcode: string;
  address: string;
  addressDetail: string;
}
