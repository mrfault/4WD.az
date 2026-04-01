// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  name_az: string;
  name_en: string;
  slug: string;
  description: string | null;
  description_az: string | null;
  description_en: string | null;
  image: string | null;
  parent: number | null;
  children?: Category[];
  product_count?: number;
}

// ─── Vehicle ─────────────────────────────────────────────────────────────────

export interface VehicleBrand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface VehicleModel {
  id: number;
  brand: number;
  brand_name?: string;
  name: string;
  slug: string;
  year_from: number | null;
  year_to: number | null;
}

export interface VehicleCompatibility {
  brand: VehicleBrand;
  models: VehicleModel[];
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type StockStatus = 'in_stock' | 'by_order' | 'out_of_stock';

export interface ProductImage {
  id: number;
  image: string;
  alt_text: string | null;
  order: number;
  is_primary: boolean;
}

export interface ProductSpecification {
  id: number;
  name: string;
  name_az: string;
  name_en: string;
  value: string;
  value_az: string;
  value_en: string;
}

export interface Product {
  id: number;
  title: string;
  title_az: string;
  title_en: string;
  slug: string;
  description: string | null;
  description_az: string | null;
  description_en: string | null;
  short_description: string | null;
  short_description_az: string | null;
  short_description_en: string | null;
  category: Category;
  price: string;
  old_price: string | null;
  discount_percent: number | null;
  stock_status: StockStatus;
  is_hot_sale: boolean;
  is_active: boolean;
  primary_image: string | null;
  images: ProductImage[];
  specifications: ProductSpecification[];
  compatible_vehicles: VehicleCompatibility[];
  created_at: string;
  updated_at: string;
}

export interface ProductList {
  id: number;
  title: string;
  title_az: string;
  title_en: string;
  slug: string;
  category: Pick<Category, 'id' | 'name' | 'name_az' | 'name_en' | 'slug'>;
  price: string;
  old_price: string | null;
  discount_percent: number | null;
  stock_status: StockStatus;
  is_hot_sale: boolean;
  primary_image: string | null;
  compatible_vehicles: VehicleCompatibility[];
}

// ─── Gallery ──────────────────────────────────────────────────────────────────

export interface GalleryItem {
  id: number;
  title: string;
  title_az: string;
  title_en: string;
  image: string;
  thumbnail: string | null;
  description: string | null;
  description_az: string | null;
  description_en: string | null;
  vehicle_brand: VehicleBrand | null;
  category: Pick<Category, 'id' | 'name' | 'name_az' | 'name_en' | 'slug'> | null;
  order: number;
  is_active: boolean;
}

// ─── Blog ─────────────────────────────────────────────────────────────────────

export interface BlogPost {
  id: number;
  title: string;
  title_az: string;
  title_en: string;
  slug: string;
  excerpt: string | null;
  excerpt_az: string | null;
  excerpt_en: string | null;
  content: string;
  content_az: string;
  content_en: string;
  featured_image: string | null;
  author: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Lead ─────────────────────────────────────────────────────────────────────

export type LeadSource = 'product' | 'contact' | 'hero' | 'general';

export interface LeadFormData {
  name?: string;
  phone: string;
  message?: string;
  source: LeadSource;
  product?: number | null;
  product_title?: string | null;
}

export interface Lead {
  id: number;
  name: string | null;
  phone: string;
  message: string | null;
  source: LeadSource;
  product: number | null;
  product_title: string | null;
  is_processed: boolean;
  created_at: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface Settings {
  contact_phone: string | null;
  contact_email: string | null;
  address_az: string | null;
  address_en: string | null;
  working_hours_az: string | null;
  working_hours_en: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  whatsapp_number: string | null;
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export type Locale = 'az' | 'en';

export interface FilterParams {
  category?: string;
  brand?: string;
  model?: string;
  min_price?: string;
  max_price?: string;
  stock_status?: StockStatus;
  is_hot_sale?: boolean;
  is_discounted?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
}
