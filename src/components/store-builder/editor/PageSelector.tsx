import { StorePage } from '../types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Info,
  Phone,
  FileText,
  File,
  ShoppingBag,
  FolderOpen,
  ShoppingCart,
  CreditCard,
  User,
  Truck,
  Search,
  LucideIcon,
} from 'lucide-react';

interface PageSelectorProps {
  pages: StorePage[];
  activePage: StorePage | null;
  onSelectPage: (page: StorePage) => void;
}

// Page type to icon mapping
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

// Categorize page types
const SYSTEM_PAGES = ['homepage', 'cart', 'checkout', 'profile', 'order_tracking', 'search'];
const CONTENT_PAGES = ['about', 'contact', 'policy'];
const PRODUCT_PAGES = ['product', 'category'];

function categorizePages(pages: StorePage[]) {
  const systemPages: StorePage[] = [];
  const contentPages: StorePage[] = [];
  const productPages: StorePage[] = [];
  const customPages: StorePage[] = [];

  pages.forEach((page) => {
    if (SYSTEM_PAGES.includes(page.page_type)) {
      systemPages.push(page);
    } else if (CONTENT_PAGES.includes(page.page_type)) {
      contentPages.push(page);
    } else if (PRODUCT_PAGES.includes(page.page_type)) {
      productPages.push(page);
    } else {
      customPages.push(page);
    }
  });

  return { systemPages, contentPages, productPages, customPages };
}

export function PageSelector({ pages, activePage, onSelectPage }: PageSelectorProps) {
  const { systemPages, contentPages, productPages, customPages } = categorizePages(pages);

  const handlePageChange = (pageId: string) => {
    const selectedPage = pages.find((p) => p.id === pageId);
    if (selectedPage) {
      console.log('[Step 1B.2] Page selected:', {
        title: selectedPage.title,
        type: selectedPage.page_type,
        id: selectedPage.id,
      });
      onSelectPage(selectedPage);
    }
  };

  const renderPageItem = (page: StorePage) => {
    const Icon = pageTypeIcons[page.page_type] || File;
    return (
      <SelectItem key={page.id} value={page.id} className="cursor-pointer">
        <div className="flex items-center justify-between w-full gap-3">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
            <span>{page.title}</span>
          </div>
          <Badge
            variant={page.is_published ? 'default' : 'secondary'}
            className="text-[10px] px-1.5 py-0 h-4"
          >
            {page.is_published ? 'Live' : 'Draft'}
          </Badge>
        </div>
      </SelectItem>
    );
  };

  const ActiveIcon = activePage ? pageTypeIcons[activePage.page_type] || File : Home;

  return (
    <div className="p-3 border-b border-border">
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
        Editing Page
      </label>
      <Select value={activePage?.id || ''} onValueChange={handlePageChange}>
        <SelectTrigger className="w-full bg-background">
          <div className="flex items-center gap-2">
            <ActiveIcon className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select a page" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-popover z-50 max-h-80">
          {/* System Pages */}
          {systemPages.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground font-semibold">
                System Pages
              </SelectLabel>
              {systemPages.map(renderPageItem)}
            </SelectGroup>
          )}

          {/* Product Pages */}
          {productPages.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground font-semibold">
                Shop Pages
              </SelectLabel>
              {productPages.map(renderPageItem)}
            </SelectGroup>
          )}

          {/* Content Pages */}
          {contentPages.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground font-semibold">
                Content Pages
              </SelectLabel>
              {contentPages.map(renderPageItem)}
            </SelectGroup>
          )}

          {/* Custom Pages */}
          {customPages.length > 0 && (
            <SelectGroup>
              <SelectLabel className="text-xs text-muted-foreground font-semibold">
                Custom Pages
              </SelectLabel>
              {customPages.map(renderPageItem)}
            </SelectGroup>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
