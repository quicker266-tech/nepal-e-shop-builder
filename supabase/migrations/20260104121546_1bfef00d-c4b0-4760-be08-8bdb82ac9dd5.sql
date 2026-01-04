-- Add new section types for product pages
ALTER TYPE public.section_type ADD VALUE IF NOT EXISTS 'product_filters';
ALTER TYPE public.section_type ADD VALUE IF NOT EXISTS 'product_sort';
ALTER TYPE public.section_type ADD VALUE IF NOT EXISTS 'recently_viewed';
ALTER TYPE public.section_type ADD VALUE IF NOT EXISTS 'recommended_products';
ALTER TYPE public.section_type ADD VALUE IF NOT EXISTS 'product_reviews';