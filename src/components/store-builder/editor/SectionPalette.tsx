/**
 * ============================================================================
 * SECTION PALETTE COMPONENT
 * ============================================================================
 * 
 * Displays available section types that can be added to the page.
 * Organized by category with icons and descriptions.
 * 
 * ============================================================================
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Image,
  Layers,
  Video,
  Star,
  Grid3X3,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ImagePlus,
  Type,
  Columns,
  Images,
  Quote,
  HelpCircle,
  Megaphone,
  Mail,
  Clock,
  BadgePercent,
  ShieldCheck,
  Building,
  Code,
  ArrowUpDown,
  Minus,
  ChevronDown,
  Plus,
  Package,
  FolderTree,
  Layout,
} from 'lucide-react';
import { SECTION_DEFINITIONS, SECTION_CATEGORIES } from '../constants';
import { SectionType } from '../types';

// Icon mapping
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Image,
  Layers,
  Video,
  Star,
  Grid3x3: Grid3X3,
  ChevronLeftRight: Columns,
  Sparkles,
  TrendingUp,
  LayoutGrid,
  ImagePlus,
  Type,
  Columns,
  Images,
  Quote,
  HelpCircle,
  Megaphone,
  Mail,
  Clock,
  BadgePercent,
  Instagram: Image,
  ShieldCheck,
  Building,
  Code,
  ArrowUpDown,
  Minus,
  LayoutTop: Layout,
  LayoutBottom: Layout,
  Package,
  FolderTree,
  Layout,
};

interface SectionPaletteProps {
  onAddSection: (type: SectionType) => void;
}

export function SectionPalette({ onAddSection }: SectionPaletteProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(['hero', 'products']);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'hero': return Image;
      case 'products': return Package;
      case 'categories': return FolderTree;
      case 'content': return Type;
      case 'marketing': return Megaphone;
      case 'layout': return Layout;
      default: return Layout;
    }
  };

  const sectionsByCategory = Object.entries(SECTION_DEFINITIONS).reduce((acc, [type, def]) => {
    if (!acc[def.category]) acc[def.category] = [];
    // Skip header and footer from palette (they're managed separately)
    if (type !== 'header' && type !== 'footer') {
      acc[def.category].push({ type: type as SectionType, ...def });
    }
    return acc;
  }, {} as Record<string, Array<{ type: SectionType; label: string; icon: string; description: string }>>);

  return (
    <div className="p-3">
      <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
        <Plus className="w-4 h-4" />
        Add Section
      </h3>
      
      <ScrollArea className="h-64">
        <div className="space-y-1">
          {SECTION_CATEGORIES.map(category => {
            const sections = sectionsByCategory[category.id] || [];
            if (sections.length === 0) return null;
            
            const CategoryIcon = getCategoryIcon(category.id);
            const isOpen = openCategories.includes(category.id);

            return (
              <Collapsible
                key={category.id}
                open={isOpen}
                onOpenChange={() => toggleCategory(category.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-9 px-2"
                  >
                    <span className="flex items-center gap-2 text-sm">
                      <CategoryIcon className="w-4 h-4 text-muted-foreground" />
                      {category.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pl-4 space-y-1 mt-1">
                  {sections.map(section => {
                    const Icon = iconMap[section.icon] || Layout;
                    return (
                      <Button
                        key={section.type}
                        variant="ghost"
                        className="w-full justify-start h-8 px-2 text-sm"
                        onClick={() => onAddSection(section.type)}
                      >
                        <Icon className="w-4 h-4 mr-2 text-muted-foreground" />
                        {section.label}
                      </Button>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
