# Phase 1B: Page Selection & Settings UI

**Version:** 0.7.1  
**Date:** January 2026  
**Status:** ✅ Complete  
**Author:** Development Team

---

## Overview

Phase 1B restructures the Store Builder sidebar to provide a more intuitive page management experience. Previously, page switching required navigating to a separate "Pages" tab and using a modal-based interface. This update introduces a persistent page selector dropdown and inline page settings, reducing clicks and improving workflow efficiency.

### Goals
1. Enable quick page switching without leaving the current context
2. Provide inline access to page-specific settings (SEO, visibility, publishing)
3. Simplify the tab structure by consolidating page management

---

## Architecture Changes

### Before (v0.7.0)
```
Store Builder Sidebar
├── Tabs
│   ├── Sections Tab (section management)
│   ├── Theme Tab (theme customization)
│   └── Pages Tab
│       └── PageManager Component (modal-based CRUD)
```

### After (v0.7.1)
```
Store Builder Sidebar
├── PageSelector (persistent dropdown - always visible)
├── Tabs
│   ├── Sections Tab (section management)
│   ├── Theme Tab (theme customization)
│   └── Settings Tab
│       └── PageSettings Component (inline form)
```

---

## New Components

### 1. PageSelector (`src/components/store-builder/editor/PageSelector.tsx`)

A dropdown component for quickly switching between store pages.

#### Purpose
Allow users to switch pages without navigating away from their current editing context.

#### Features
- **Grouped Pages**: Pages are categorized into logical groups:
  - System Pages: homepage, cart, checkout, profile, order_tracking, search
  - Shop Pages: product, category
  - Content Pages: about, contact, policy
  - Custom Pages: user-created pages
- **Visual Indicators**:
  - Page-type icons (Home, ShoppingCart, Info, etc.)
  - Live/Draft status badges
- **Accessibility**: Uses shadcn Select component with proper ARIA attributes

#### Props Interface
```typescript
interface PageSelectorProps {
  pages: StorePage[];           // All available pages
  activePage: StorePage | null; // Currently selected page
  onSelectPage: (page: StorePage) => void; // Selection callback
}
```

#### Page Type Icons Mapping
```typescript
const pageTypeIcons: Record<string, LucideIcon> = {
  homepage: Home,
  about: Info,
  contact: Phone,
  policy: FileText,
  custom: File,
  product: ShoppingBag,
  category: FolderOpen,
  cart: ShoppingCart,
  checkout: CreditCard,
  profile: User,
  order_tracking: Truck,
  search: Search,
};
```

#### Console Logging
- `[Step 1B.2] Page selected: {title, type, id}` - Fired when user selects a page

---

### 2. PageSettings (`src/components/store-builder/editor/PageSettings.tsx`)

An inline form component for configuring individual page settings.

#### Purpose
Provide quick access to page configuration without modal dialogs.

#### Fields

| Field | Type | Description | Editable For |
|-------|------|-------------|--------------|
| `title` | Input | Page display name | All pages |
| `slug` | Input | URL path segment | Custom pages only |
| `seo_title` | Input | SEO meta title | All pages |
| `seo_description` | Textarea | SEO meta description | All pages |
| `og_image_url` | Input | Social sharing image URL | All pages |
| `show_header` | Switch | Display header on page | All pages |
| `show_footer` | Switch | Display footer on page | All pages |
| `is_published` | Switch | Page visibility status | All pages |

#### System Page Slug Protection
System pages (homepage, cart, checkout, profile, order_tracking, search) have fixed slugs that cannot be modified to prevent breaking core functionality.

```typescript
const SYSTEM_PAGE_TYPES = ['homepage', 'cart', 'checkout', 'profile', 'order_tracking', 'search'];
const isSystemPage = SYSTEM_PAGE_TYPES.includes(page.page_type);
// Slug input is disabled when isSystemPage is true
```

#### Save Behavior
- **Toggle switches**: Save immediately on change (no confirmation needed)
- **Text fields**: Require explicit "Save Changes" button click
- **hasChanges state**: Tracks unsaved modifications for text fields

#### Props Interface
```typescript
interface PageSettingsProps {
  page: StorePage;
  onUpdate: (updates: Partial<StorePage>) => void;
}
```

#### Console Logging
- `[Step 1B.4] Page settings changed: {field, value}` - Field modification (not yet saved)
- `[Step 1B.4] Page settings updated: {field, value}` - Saved to database

---

## Modified Components

### StoreBuilder (`src/components/store-builder/StoreBuilder.tsx`)

#### Import Changes
```typescript
// Added imports
import { PageSelector } from './editor/PageSelector';
import { PageSettings } from './editor/PageSettings';
```

#### Tab Structure Change
```typescript
// Before
const tabs = ['sections', 'theme', 'pages'];

// After
const tabs = ['sections', 'theme', 'settings'];
```

#### New Handler Functions

```typescript
// Page selection handler
const handlePageSelect = (page: StorePage) => {
  console.log('[Step 1B.3] Page changed via selector:', {
    from: activePage?.title,
    to: page.title,
  });
  setActivePage(page);
};
```

#### Layout Changes
```jsx
// PageSelector is now rendered above the tabs
<div className="flex flex-col h-full">
  <PageSelector
    pages={pages}
    activePage={activePage}
    onSelectPage={handlePageSelect}
  />
  <Tabs defaultValue="sections" className="flex-1">
    {/* ... */}
  </Tabs>
</div>
```

#### Settings Tab Content
```jsx
<TabsContent value="settings" className="p-4 space-y-4">
  {activePage && (
    <PageSettings
      page={activePage}
      onUpdate={(updates) => updatePage(activePage.id, updates)}
    />
  )}
</TabsContent>
```

---

## Database Schema

No database changes were required. This phase uses the existing `store_pages` table:

```sql
TABLE: store_pages
├── id (uuid, PK)
├── store_id (uuid, FK → stores)
├── title (text)
├── slug (text)
├── page_type (enum: page_type)
├── is_published (boolean)
├── show_header (boolean)
├── show_footer (boolean)
├── seo_title (text, nullable)
├── seo_description (text, nullable)
├── og_image_url (text, nullable)
├── published_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## Console Logging Reference

For debugging and development, the following console logs are available:

| Log Pattern | Component | Trigger |
|-------------|-----------|---------|
| `[Step 1B.2] Page selected: {...}` | PageSelector | Dropdown selection |
| `[Step 1B.3] Page changed via selector: {...}` | StoreBuilder | Page switch |
| `[Step 1B.4] Page settings changed: {...}` | PageSettings | Input field change |
| `[Step 1B.4] Page settings updated: {...}` | PageSettings | Toggle or Save button |

---

## Testing Checklist

### PageSelector
- [ ] Displays all store pages grouped by category
- [ ] Shows correct icon for each page type
- [ ] Displays Live/Draft badge accurately
- [ ] Triggers page switch on selection
- [ ] Updates preview frame when page changes

### PageSettings
- [ ] Displays current page data correctly
- [ ] Title field is editable
- [ ] Slug field is disabled for system pages
- [ ] SEO fields accept and save content
- [ ] Toggle switches save immediately
- [ ] "Save Changes" button appears when text fields are modified
- [ ] Published toggle updates page visibility

### Integration
- [ ] PageSelector persists above tabs
- [ ] Settings tab shows PageSettings for active page
- [ ] Page sections update when switching pages
- [ ] Theme settings remain independent of page selection

---

## Migration Notes

### For Developers

1. **Tab Value Updates**: If you have any code referencing the old `pages` tab, update it to use `settings`.

2. **PageManager Deprecation**: The modal-based `PageManager` component is still available for advanced page operations (create, delete, duplicate) but is no longer the primary interface.

3. **Console Logs**: Development logs are prefixed with step numbers `[Step 1B.X]` for easier filtering during debugging.

### Breaking Changes
- None. All changes are additive and backward-compatible.

---

## Dependencies

No new dependencies were added in this phase.

---

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/components/store-builder/editor/PageSelector.tsx` | Created | New page switching dropdown |
| `src/components/store-builder/editor/PageSettings.tsx` | Created | New inline settings form |
| `src/components/store-builder/StoreBuilder.tsx` | Modified | Integrated new components, restructured tabs |

---

## Related Documentation

- [Store Builder Types](../src/components/store-builder/types.ts) - TypeScript interfaces
- [useStoreBuilder Hook](../src/hooks/useStoreBuilder.ts) - Data fetching and mutations
- [PRD](./PRD.md) - Product requirements document

---

## Next Steps (Phase 1C)

Phase 1C will add page management capabilities:
- Create new pages
- Delete pages (with confirmation)
- Duplicate existing pages
- Page templates for quick starts
