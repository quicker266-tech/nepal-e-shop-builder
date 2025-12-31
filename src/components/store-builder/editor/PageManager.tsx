/**
 * ============================================================================
 * PAGE MANAGER COMPONENT
 * ============================================================================
 * 
 * Manages store pages (create, select, delete).
 * Displays list of pages with type icons and publication status.
 * Shows standard pages (Homepage, Products, About, Contact) and custom pages.
 * 
 * ============================================================================
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Home, Info, Phone, FileCheck, Trash2, ShoppingBag, Eye, EyeOff } from 'lucide-react';
import { StorePage, PageType } from '../types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PageManagerProps {
  pages: StorePage[];
  activePage: StorePage | null;
  onSelectPage: (page: StorePage) => void;
  onCreatePage: (page: Partial<StorePage>) => Promise<StorePage | null>;
  onUpdatePage: (pageId: string, updates: Partial<StorePage>) => void;
  onDeletePage: (pageId: string) => void;
}

/**
 * Icon mapping for page types and slugs
 */
const getPageIcon = (page: StorePage) => {
  // Check by slug first for standard pages
  switch (page.slug) {
    case 'home':
      return Home;
    case 'products':
      return ShoppingBag;
    case 'about':
      return Info;
    case 'contact':
      return Phone;
    default:
      // Then by page type
      switch (page.page_type) {
        case 'homepage':
          return Home;
        case 'about':
          return Info;
        case 'contact':
          return Phone;
        case 'policy':
          return FileCheck;
        default:
          return FileText;
      }
  }
};

// Standard pages that cannot be deleted
const PROTECTED_SLUGS = ['home', 'products', 'about', 'contact'];

export function PageManager({
  pages,
  activePage,
  onSelectPage,
  onCreatePage,
  onUpdatePage,
  onDeletePage,
}: PageManagerProps) {
  const [newPageTitle, setNewPageTitle] = useState('');

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;
    
    const slug = newPageTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const page = await onCreatePage({
      title: newPageTitle,
      slug,
      page_type: 'custom',
      is_published: true,
    });
    
    if (page) {
      setNewPageTitle('');
      onSelectPage(page);
    }
  };

  const togglePublish = (page: StorePage, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdatePage(page.id, { is_published: !page.is_published });
  };

  // Sort pages: homepage first, then standard pages, then custom
  const sortedPages = [...pages].sort((a, b) => {
    const order = ['home', 'products', 'about', 'contact'];
    const aIndex = order.indexOf(a.slug);
    const bIndex = order.indexOf(b.slug);
    
    if (aIndex >= 0 && bIndex >= 0) return aIndex - bIndex;
    if (aIndex >= 0) return -1;
    if (bIndex >= 0) return 1;
    return a.title.localeCompare(b.title);
  });

  return (
    <div className="p-4 space-y-4">
      {/* Page count summary */}
      <div className="text-sm text-muted-foreground">
        {pages.length} page{pages.length !== 1 ? 's' : ''} • {pages.filter(p => p.is_published).length} published
      </div>

      {/* Page list */}
      <ScrollArea className="h-[350px]">
        <div className="space-y-1">
          {sortedPages.map((page) => {
            const Icon = getPageIcon(page);
            const isProtected = PROTECTED_SLUGS.includes(page.slug);
            
            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(page)}
                className={cn(
                  'flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors',
                  activePage?.id === page.id 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'hover:bg-muted border border-transparent'
                )}
              >
                <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{page.title}</span>
                    {isProtected && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        Standard
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">/{page.slug}</span>
                </div>
                
                {/* Publish toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => togglePublish(page, e)}
                  title={page.is_published ? 'Unpublish' : 'Publish'}
                >
                  {page.is_published ? (
                    <Eye className="w-3.5 h-3.5 text-green-600" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </Button>
                
                {/* Delete button (only for non-protected pages) */}
                {!isProtected && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Create new page */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground mb-2">Add a custom page</p>
        <div className="flex gap-2">
          <Input
            placeholder="Page name..."
            value={newPageTitle}
            onChange={(e) => setNewPageTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
            className="h-9"
          />
          <Button size="sm" onClick={handleCreatePage} disabled={!newPageTitle.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
