# Development Guide

## Project Overview

This is a multi-tenant e-commerce platform with a visual store builder. Store owners can customize their storefronts using a drag-and-drop editor.

---

## Architecture

### Frontend Stack
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (using semantic tokens)
- **shadcn/ui** - Component library
- **React Router** - Routing
- **TanStack Query** - Data fetching

### Backend (Lovable Cloud / Supabase)
- **PostgreSQL** - Database
- **Row Level Security (RLS)** - Data access control
- **Edge Functions** - Serverless functions
- **Storage** - File uploads

---

## Key Directories

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui base components
│   ├── dashboard/     # Dashboard-specific components
│   ├── store-builder/ # Visual editor components
│   └── products/      # Product-related components
├── contexts/          # React contexts (Auth, Cart, Store)
├── hooks/             # Custom React hooks
├── layouts/           # Page layouts
├── pages/             # Route pages
│   ├── dashboard/     # Store admin pages
│   ├── admin/         # Super admin pages
│   └── storefront/    # Customer-facing pages
├── integrations/      # External service integrations
│   └── supabase/      # Supabase client & types
└── lib/               # Utility functions
```

---

## Store Builder Module

### Purpose
Allow store owners to visually customize their storefront without coding.

### Components Flow
```
StoreBuilder (main container)
├── EditorHeader (preview controls)
├── Left Sidebar
│   ├── SectionPalette (add sections)
│   ├── SectionList (manage sections)
│   ├── ThemeEditor (customize theme)
│   └── PageManager (manage pages)
├── PreviewFrame (live preview)
└── Right Sidebar
    └── SectionEditor (configure selected section)
```

### Data Flow
1. User loads Store Builder → hooks fetch theme, pages, sections
2. User adds section → `addSection()` creates DB record
3. User configures section → `updateSectionConfig()` saves to DB
4. User reorders sections → `reorderSections()` updates sort_order
5. Preview updates in real-time from local state

### Section Configuration
Each section type has a JSONB `config` field with type-specific properties:

```typescript
// Example: Hero Banner Config
interface HeroBannerConfig {
  title: string;
  subtitle?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundImage?: string;
  backgroundOverlay?: number;
  textAlignment?: 'left' | 'center' | 'right';
  height?: 'small' | 'medium' | 'large' | 'full';
}
```

---

## Database Schema

### Core Tables
| Table | Purpose |
|-------|---------|
| `stores` | Store information |
| `products` | Product catalog |
| `categories` | Product categories |
| `orders` | Customer orders |
| `customers` | Store customers |

### Store Builder Tables
| Table | Purpose |
|-------|---------|
| `store_themes` | Theme settings (colors, fonts, layout) |
| `store_pages` | Custom pages |
| `page_sections` | Page sections with config |
| `store_navigation` | Nav menus |
| `store_header_footer` | Header/footer config |

---

## Styling Guidelines

### Use Semantic Tokens
```tsx
// ✅ Good - uses semantic tokens
<div className="bg-background text-foreground border-border" />

// ❌ Bad - uses direct colors
<div className="bg-white text-black border-gray-200" />
```

### Available Tokens (index.css)
- `--background`, `--foreground` - Page background/text
- `--primary`, `--primary-foreground` - Primary buttons
- `--secondary`, `--secondary-foreground` - Secondary elements
- `--muted`, `--muted-foreground` - Muted backgrounds/text
- `--accent` - Accent color
- `--border` - Border color
- `--destructive` - Error/delete actions

---

## Adding Features

### New Dashboard Page
1. Create page in `src/pages/dashboard/`
2. Add route in `src/App.tsx` under dashboard routes
3. Add sidebar link in `src/components/dashboard/DashboardSidebar.tsx`

### New Database Table
1. Create migration using Supabase migration tool
2. Include RLS policies for security
3. Types auto-generate in `src/integrations/supabase/types.ts`

### New API Integration
1. Add secrets using the secrets tool
2. Create edge function if needed
3. Use the supabase client for database operations

---

## Common Patterns

### Fetching Data with Hooks
```typescript
const { data, loading, error, refetch } = useMyData(storeId);
```

### Handling Forms
```typescript
const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { ... }
});
```

### Toast Notifications
```typescript
const { toast } = useToast();
toast({ title: "Success!", description: "..." });
toast({ title: "Error", variant: "destructive" });
```

---

## Troubleshooting

### Build Errors
- Check TypeScript types match database schema
- Ensure all imports are correct
- Run `npm run build` locally to catch issues

### RLS Errors
- Check user is authenticated
- Verify RLS policies allow the operation
- Use Supabase logs to debug

### State Not Updating
- Check if using the correct hook
- Verify refetch is called after mutations
- Check React Query cache settings
