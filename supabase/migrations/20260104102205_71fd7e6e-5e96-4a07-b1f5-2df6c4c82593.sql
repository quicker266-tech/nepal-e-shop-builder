-- ============================================================================
-- MIGRATION PART 2: Complete Page Builder System
-- ============================================================================

-- STEP 1: Add Business Classification to Stores Table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'business_type'
    ) THEN
        ALTER TABLE public.stores 
        ADD COLUMN business_type TEXT DEFAULT 'ecommerce' NOT NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' AND column_name = 'business_category'
    ) THEN
        ALTER TABLE public.stores 
        ADD COLUMN business_category TEXT DEFAULT 'general' NOT NULL;
    END IF;
END $$;

-- STEP 2: Create Page Templates Table
CREATE TABLE IF NOT EXISTS public.page_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_type TEXT NOT NULL,
  business_category TEXT,
  page_type public.page_type NOT NULL,
  template_name TEXT NOT NULL,
  description TEXT,
  default_sections JSONB NOT NULL DEFAULT '[]'::jsonb,
  default_title TEXT,
  default_slug TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  preview_image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_template_per_business UNIQUE (business_type, business_category, page_type, template_name)
);

ALTER TABLE public.page_templates ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'page_templates' AND policyname = 'Anyone can view active templates'
    ) THEN
        CREATE POLICY "Anyone can view active templates"
          ON public.page_templates FOR SELECT
          USING (is_active = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'page_templates' AND policyname = 'Super admins can manage templates'
    ) THEN
        CREATE POLICY "Super admins can manage templates"
          ON public.page_templates FOR ALL
          USING (is_super_admin(auth.uid()));
    END IF;
END $$;

-- STEP 3: Fix Existing Data - Update Products Pages
UPDATE public.store_pages
SET 
  page_type = 'product',
  updated_at = now()
WHERE 
  page_type = 'custom' 
  AND (slug = 'products' OR title ILIKE '%product%');

-- STEP 4: Create Standard Page Configurations
INSERT INTO public.page_templates (business_type, business_category, page_type, template_name, default_title, default_slug, default_sections, description, sort_order)
VALUES
  ('ecommerce', NULL, 'homepage', 'E-commerce Homepage', 'Home', 'home',
    '[{"type": "hero_banner", "name": "Hero Section"}, {"type": "featured_products", "name": "Featured Products"}, {"type": "category_grid", "name": "Shop by Category"}, {"type": "testimonials", "name": "Customer Reviews"}]'::jsonb,
    'Standard homepage for e-commerce stores', 1),
  ('ecommerce', NULL, 'product', 'Product Catalog', 'Products', 'products', '[]'::jsonb, 'Product listing and filtering page', 2),
  ('ecommerce', NULL, 'category', 'Category Browser', 'Categories', 'categories', '[]'::jsonb, 'Browse products by category', 3),
  ('ecommerce', NULL, 'cart', 'Shopping Cart', 'Cart', 'cart', '[]'::jsonb, 'Shopping cart and checkout flow', 4),
  ('ecommerce', NULL, 'checkout', 'Checkout', 'Checkout', 'checkout', '[]'::jsonb, 'Order completion and payment', 5),
  ('ecommerce', NULL, 'profile', 'Customer Profile', 'My Account', 'profile', '[]'::jsonb, 'Customer account and order history', 6),
  ('ecommerce', NULL, 'about', 'About Us', 'About Us', 'about',
    '[{"type": "text_block", "name": "About Content"}, {"type": "image_text", "name": "Our Story"}, {"type": "trust_badges", "name": "Why Choose Us"}]'::jsonb,
    'Standard about page', 7),
  ('ecommerce', NULL, 'contact', 'Contact Us', 'Contact', 'contact',
    '[{"type": "text_block", "name": "Contact Information"}]'::jsonb,
    'Standard contact page', 8)
ON CONFLICT (business_type, business_category, page_type, template_name) 
DO UPDATE SET
  default_sections = EXCLUDED.default_sections,
  updated_at = now();

-- STEP 5: Helper Function - Get Standard Pages for Business Type
CREATE OR REPLACE FUNCTION public.get_standard_pages_for_business(
  p_business_type TEXT,
  p_business_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  page_type public.page_type,
  title TEXT,
  slug TEXT,
  default_sections JSONB,
  sort_order INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.page_type,
    pt.default_title,
    pt.default_slug,
    pt.default_sections,
    pt.sort_order
  FROM public.page_templates pt
  WHERE 
    pt.business_type = p_business_type
    AND (pt.business_category IS NULL OR pt.business_category = p_business_category)
    AND pt.is_active = true
  ORDER BY pt.sort_order;
END;
$$;

-- STEP 6: Add unique constraint on store_pages if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'store_pages_store_id_slug_key'
    ) THEN
        ALTER TABLE public.store_pages 
        ADD CONSTRAINT store_pages_store_id_slug_key UNIQUE (store_id, slug);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- STEP 7: Helper Function - Initialize Pages for Store
CREATE OR REPLACE FUNCTION public.initialize_store_pages(
  p_store_id UUID,
  p_business_type TEXT DEFAULT 'ecommerce',
  p_business_category TEXT DEFAULT 'general'
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_page_count INTEGER := 0;
  v_template RECORD;
  v_page_id UUID;
  v_section JSONB;
  v_section_order INTEGER;
BEGIN
  FOR v_template IN 
    SELECT * FROM public.get_standard_pages_for_business(p_business_type, p_business_category)
  LOOP
    INSERT INTO public.store_pages (
      store_id,
      title,
      slug,
      page_type,
      is_published,
      show_header,
      show_footer
    )
    VALUES (
      p_store_id,
      v_template.title,
      v_template.slug,
      v_template.page_type,
      true,
      true,
      true
    )
    ON CONFLICT (store_id, slug) DO NOTHING
    RETURNING id INTO v_page_id;
    
    IF v_page_id IS NOT NULL THEN
      v_page_count := v_page_count + 1;
      
      v_section_order := 0;
      FOR v_section IN SELECT * FROM jsonb_array_elements(v_template.default_sections)
      LOOP
        INSERT INTO public.page_sections (
          page_id,
          store_id,
          section_type,
          name,
          config,
          sort_order,
          is_visible
        )
        VALUES (
          v_page_id,
          p_store_id,
          (v_section->>'type')::public.section_type,
          v_section->>'name',
          '{}'::jsonb,
          v_section_order,
          true
        );
        
        v_section_order := v_section_order + 1;
      END LOOP;
    END IF;
  END LOOP;
  
  RETURN v_page_count;
END;
$$;

-- STEP 8: Add Missing Pages to Existing Stores
DO $$
DECLARE
  v_store RECORD;
  v_pages_created INTEGER;
BEGIN
  FOR v_store IN SELECT id, name, business_type, business_category FROM public.stores
  LOOP
    SELECT public.initialize_store_pages(
      v_store.id,
      COALESCE(v_store.business_type, 'ecommerce'),
      COALESCE(v_store.business_category, 'general')
    ) INTO v_pages_created;
  END LOOP;
END $$;

-- STEP 9: Create Database Trigger for Auto-Initialization
CREATE OR REPLACE FUNCTION public.auto_initialize_store_pages()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.initialize_store_pages(
    NEW.id,
    COALESCE(NEW.business_type, 'ecommerce'),
    COALESCE(NEW.business_category, 'general')
  );
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_initialize_pages ON public.stores;

CREATE TRIGGER trigger_auto_initialize_pages
  AFTER INSERT ON public.stores
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_initialize_store_pages();

-- STEP 10: Add Helpful Indexes
CREATE INDEX IF NOT EXISTS idx_page_templates_business 
  ON public.page_templates(business_type, business_category, is_active);

CREATE INDEX IF NOT EXISTS idx_store_pages_type 
  ON public.store_pages(store_id, page_type) 
  WHERE is_published = true;