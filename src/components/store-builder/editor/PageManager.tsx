/**
 * PAGE MANAGER COMPONENT
 * Manages store pages (create, edit, delete, publish)
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Home, Info, Phone, FileCheck, Trash2 } from 'lucide-react';
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

const pageTypeIcons: Record<PageType, React.ComponentType<{ className?: string }>> = {
  homepage: Home,
  about: Info,
  contact: Phone,
  policy: FileCheck,
  custom: FileText,
};

export function PageManager({
  pages,
  activePage,
  onSelectPage,
  onCreatePage,
  onDeletePage,
}: PageManagerProps) {
  const [newPageTitle, setNewPageTitle] = useState('');

  const handleCreatePage = async () => {
    if (!newPageTitle.trim()) return;
    const slug = newPageTitle.toLowerCase().replace(/\s+/g, '-');
    const page = await onCreatePage({
      title: newPageTitle,
      slug,
      page_type: 'custom',
    });
    if (page) {
      setNewPageTitle('');
      onSelectPage(page);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="New page name..."
          value={newPageTitle}
          onChange={(e) => setNewPageTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
        />
        <Button size="icon" onClick={handleCreatePage}>
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-1">
          {pages.map((page) => {
            const Icon = pageTypeIcons[page.page_type];
            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(page)}
                className={cn(
                  'flex items-center gap-2 p-2 rounded-lg cursor-pointer',
                  activePage?.id === page.id ? 'bg-primary/10' : 'hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="flex-1 text-sm truncate">{page.title}</span>
                {page.is_published && (
                  <Badge variant="secondary" className="text-xs">Live</Badge>
                )}
                {page.page_type !== 'homepage' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); onDeletePage(page.id); }}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
