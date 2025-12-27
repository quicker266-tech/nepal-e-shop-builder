/**
 * ============================================================================
 * SECTION LIST COMPONENT
 * ============================================================================
 * 
 * Displays the current sections on the page.
 * Supports drag-and-drop reordering, visibility toggle, and section actions.
 * 
 * ============================================================================
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  Eye,
  EyeOff,
  MoreHorizontal,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { PageSection } from '../types';
import { SECTION_DEFINITIONS } from '../constants';
import { cn } from '@/lib/utils';

interface SectionListProps {
  sections: PageSection[];
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
  onReorder: (sections: PageSection[]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

export function SectionList({
  sections,
  selectedSectionId,
  onSelectSection,
  onReorder,
  onDelete,
  onDuplicate,
  onToggleVisibility,
}: SectionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const [draggedSection] = newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, draggedSection);
    
    setDraggedIndex(index);
    onReorder(newSections);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    onReorder(newSections);
  };

  if (sections.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-muted-foreground">
          No sections yet. Add sections from the palette above.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="flex-1">
      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Page Sections ({sections.length})
        </h3>
        
        {sections.map((section, index) => {
          const definition = SECTION_DEFINITIONS[section.section_type];
          
          return (
            <div
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onSelectSection(section.id)}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                'border border-transparent hover:border-border',
                selectedSectionId === section.id
                  ? 'bg-primary/10 border-primary/30'
                  : 'hover:bg-muted/50',
                !section.is_visible && 'opacity-50'
              )}
            >
              {/* Drag handle */}
              <div
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Section info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {section.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {definition?.label || section.section_type}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => onToggleVisibility(section.id)}
                >
                  {section.is_visible ? (
                    <Eye className="w-3.5 h-3.5" />
                  ) : (
                    <EyeOff className="w-3.5 h-3.5" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Move Up
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Move Down
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDuplicate(section.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(section.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
