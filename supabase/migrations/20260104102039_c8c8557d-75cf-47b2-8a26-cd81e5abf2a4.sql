-- ============================================================================
-- MIGRATION PART 1: Extend Page Type Enum
-- Must be committed separately before enum values can be used
-- ============================================================================

ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'product';
ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'category';
ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'cart';
ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'checkout';
ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'profile';
ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'order_tracking';
ALTER TYPE public.page_type ADD VALUE IF NOT EXISTS 'search';

COMMENT ON TYPE public.page_type IS 
'Types of pages in the store. 
System pages (homepage, product, category, cart, checkout, profile, order_tracking, search) are auto-created.
Standard pages (about, contact, policy) are common but optional.
Custom pages are user-defined.';