-- ============================================================================
-- STORE BUILDER DATABASE SCHEMA
-- ============================================================================
-- This schema supports a full visual editor for store customization.
-- It's designed for extensibility and future scalability.
-- ============================================================================

-- ============================================================================
-- 1. STORE THEMES TABLE
-- ============================================================================
-- Stores the visual theme settings for each store (colors, fonts, etc.)
-- Each store can have multiple themes but only one active at a time.
-- ============================================================================

CREATE TABLE public.store_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default Theme',
  is_active BOOLEAN NOT NULL DEFAULT false,
  
  -- Color System (HSL values stored as strings for flexibility)
  colors JSONB NOT NULL DEFAULT '{
    "primary": "222 47% 31%",
    "secondary": "210 40% 96%",
    "accent": "217 91% 60%",
    "background": "0 0% 100%",
    "foreground": "222 47% 11%",
    "muted": "210 40% 96%",
    "mutedForeground": "215 16% 47%",
    "border": "214 32% 91%",
    "success": "142 76% 36%",
    "warning": "38 92% 50%",
    "error": "0 84% 60%"
  }'::jsonb,
  
  -- Typography System
  typography JSONB NOT NULL DEFAULT '{
    "headingFont": "Plus Jakarta Sans",
    "bodyFont": "Plus Jakarta Sans",
    "baseFontSize": "16px",
    "headingWeight": "700",
    "bodyWeight": "400"
  }'::jsonb,
  
  -- Spacing & Layout
  layout JSONB NOT NULL DEFAULT '{
    "containerMaxWidth": "1280px",
    "sectionPadding": "4rem",
    "borderRadius": "0.5rem",
    "buttonRadius": "0.375rem"
  }'::jsonb,
  
  -- Custom CSS (advanced users)
  custom_css TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_themes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Store members can manage themes"
  ON public.store_themes FOR ALL
  USING (can_access_store(auth.uid(), store_id));

CREATE POLICY "Anyone can view active theme of active stores"
  ON public.store_themes FOR SELECT
  USING (is_active = true AND EXISTS (
    SELECT 1 FROM stores WHERE stores.id = store_themes.store_id AND stores.status = 'active'
  ));

-- ============================================================================
-- 2. STORE PAGES TABLE
-- ============================================================================
-- Stores custom pages created by store owners.
-- Supports homepage, about, contact, policies, and custom pages.
-- ============================================================================

CREATE TYPE public.page_type AS ENUM ('homepage', 'about', 'contact', 'policy', 'custom');

CREATE TABLE public.store_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Page Metadata
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  page_type public.page_type NOT NULL DEFAULT 'custom',
  
  -- SEO Settings
  seo_title TEXT,
  seo_description TEXT,
  og_image_url TEXT,
  
  -- Page Status
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Page Settings
  show_header BOOLEAN NOT NULL DEFAULT true,
  show_footer BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique slugs per store
  CONSTRAINT unique_page_slug_per_store UNIQUE (store_id, slug)
);

-- Enable RLS
ALTER TABLE public.store_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Store members can manage pages"
  ON public.store_pages FOR ALL
  USING (can_access_store(auth.uid(), store_id));

CREATE POLICY "Anyone can view published pages of active stores"
  ON public.store_pages FOR SELECT
  USING (is_published = true AND EXISTS (
    SELECT 1 FROM stores WHERE stores.id = store_pages.store_id AND stores.status = 'active'
  ));

-- ============================================================================
-- 3. PAGE SECTIONS TABLE
-- ============================================================================
-- Stores the sections/blocks that make up each page.
-- Each section has a type and configuration stored as JSONB.
-- Supports drag-drop reordering via sort_order.
-- ============================================================================

CREATE TYPE public.section_type AS ENUM (
  -- Header/Footer
  'header', 'footer',
  -- Hero Sections
  'hero_banner', 'hero_slider', 'hero_video',
  -- Product Sections
  'featured_products', 'product_grid', 'product_carousel', 'new_arrivals', 'best_sellers',
  -- Category Sections
  'category_grid', 'category_banner',
  -- Content Sections
  'text_block', 'image_text', 'gallery', 'testimonials', 'faq',
  -- Marketing
  'announcement_bar', 'newsletter', 'countdown', 'promo_banner',
  -- Social/Trust
  'social_feed', 'trust_badges', 'brand_logos',
  -- Custom
  'custom_html', 'spacer', 'divider'
);

CREATE TABLE public.page_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID NOT NULL REFERENCES public.store_pages(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Section Definition
  section_type public.section_type NOT NULL,
  name TEXT NOT NULL, -- User-friendly name for the section
  
  -- Section Configuration (type-specific settings)
  -- This JSONB stores all the customizable properties for each section type
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Visibility & Order
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Responsive Settings
  mobile_config JSONB, -- Override config for mobile
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Store members can manage sections"
  ON public.page_sections FOR ALL
  USING (can_access_store(auth.uid(), store_id));

CREATE POLICY "Anyone can view visible sections of published pages"
  ON public.page_sections FOR SELECT
  USING (is_visible = true AND EXISTS (
    SELECT 1 FROM store_pages sp
    JOIN stores s ON s.id = sp.store_id
    WHERE sp.id = page_sections.page_id
    AND sp.is_published = true
    AND s.status = 'active'
  ));

-- ============================================================================
-- 4. STORE NAVIGATION TABLE
-- ============================================================================
-- Stores header/footer navigation menus.
-- Supports nested menus via parent_id.
-- ============================================================================

CREATE TYPE public.nav_location AS ENUM ('header', 'footer', 'mobile');

CREATE TABLE public.store_navigation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  
  -- Menu Item Properties
  label TEXT NOT NULL,
  url TEXT, -- Can be internal path or external URL
  page_id UUID REFERENCES public.store_pages(id) ON DELETE SET NULL, -- Link to internal page
  
  -- Navigation Structure
  location public.nav_location NOT NULL DEFAULT 'header',
  parent_id UUID REFERENCES public.store_navigation(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  
  -- Styling
  is_highlighted BOOLEAN NOT NULL DEFAULT false, -- For CTA buttons
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_navigation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Store members can manage navigation"
  ON public.store_navigation FOR ALL
  USING (can_access_store(auth.uid(), store_id));

CREATE POLICY "Anyone can view navigation of active stores"
  ON public.store_navigation FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM stores WHERE stores.id = store_navigation.store_id AND stores.status = 'active'
  ));

-- ============================================================================
-- 5. STORE HEADER/FOOTER SETTINGS TABLE
-- ============================================================================
-- Global header and footer configuration for the store.
-- ============================================================================

CREATE TABLE public.store_header_footer (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE UNIQUE,
  
  -- Header Settings
  header_config JSONB NOT NULL DEFAULT '{
    "layout": "logo-center",
    "sticky": true,
    "showSearch": true,
    "showCart": true,
    "showAccount": false,
    "announcementBar": null,
    "backgroundColor": null,
    "textColor": null
  }'::jsonb,
  
  -- Footer Settings
  footer_config JSONB NOT NULL DEFAULT '{
    "layout": "multi-column",
    "showNewsletter": true,
    "showSocialLinks": true,
    "showPaymentIcons": true,
    "copyrightText": null,
    "backgroundColor": null,
    "textColor": null,
    "columns": []
  }'::jsonb,
  
  -- Social Links
  social_links JSONB NOT NULL DEFAULT '{
    "facebook": null,
    "instagram": null,
    "twitter": null,
    "tiktok": null,
    "youtube": null,
    "pinterest": null
  }'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.store_header_footer ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Store members can manage header/footer"
  ON public.store_header_footer FOR ALL
  USING (can_access_store(auth.uid(), store_id));

CREATE POLICY "Anyone can view header/footer of active stores"
  ON public.store_header_footer FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM stores WHERE stores.id = store_header_footer.store_id AND stores.status = 'active'
  ));

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_store_themes_store_id ON public.store_themes(store_id);
CREATE INDEX idx_store_themes_active ON public.store_themes(store_id, is_active) WHERE is_active = true;

CREATE INDEX idx_store_pages_store_id ON public.store_pages(store_id);
CREATE INDEX idx_store_pages_slug ON public.store_pages(store_id, slug);
CREATE INDEX idx_store_pages_published ON public.store_pages(store_id, is_published) WHERE is_published = true;

CREATE INDEX idx_page_sections_page_id ON public.page_sections(page_id);
CREATE INDEX idx_page_sections_store_id ON public.page_sections(store_id);
CREATE INDEX idx_page_sections_order ON public.page_sections(page_id, sort_order);

CREATE INDEX idx_store_navigation_store_id ON public.store_navigation(store_id);
CREATE INDEX idx_store_navigation_location ON public.store_navigation(store_id, location);
CREATE INDEX idx_store_navigation_parent ON public.store_navigation(parent_id);

-- ============================================================================
-- 7. TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE TRIGGER update_store_themes_updated_at
  BEFORE UPDATE ON public.store_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_pages_updated_at
  BEFORE UPDATE ON public.store_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_page_sections_updated_at
  BEFORE UPDATE ON public.page_sections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_navigation_updated_at
  BEFORE UPDATE ON public.store_navigation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_store_header_footer_updated_at
  BEFORE UPDATE ON public.store_header_footer
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();