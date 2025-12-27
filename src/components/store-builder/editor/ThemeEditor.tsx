/**
 * THEME EDITOR COMPONENT
 * Edit store colors, fonts, and layout settings
 */

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Type, Layout } from 'lucide-react';
import { StoreTheme, ThemeColors } from '../types';
import { AVAILABLE_FONTS } from '../constants';

interface ThemeEditorProps {
  theme: StoreTheme;
  onUpdate: (updates: Partial<StoreTheme>) => void;
}

export function ThemeEditor({ theme, onUpdate }: ThemeEditorProps) {
  const updateColor = (key: keyof ThemeColors, value: string) => {
    onUpdate({ colors: { ...theme.colors, [key]: value } });
  };

  const colorFields: { key: keyof ThemeColors; label: string }[] = [
    { key: 'primary', label: 'Primary' },
    { key: 'secondary', label: 'Secondary' },
    { key: 'accent', label: 'Accent' },
    { key: 'background', label: 'Background' },
    { key: 'foreground', label: 'Text' },
  ];

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        {/* Colors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Palette className="w-4 h-4" /> Colors
          </div>
          <div className="grid grid-cols-2 gap-3">
            {colorFields.map(({ key, label }) => (
              <div key={key}>
                <Label className="text-xs">{label}</Label>
                <Input
                  value={theme.colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  placeholder="222 47% 31%"
                  className="text-xs"
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Type className="w-4 h-4" /> Typography
          </div>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Heading Font</Label>
              <Select
                value={theme.typography.headingFont}
                onValueChange={(v) => onUpdate({ typography: { ...theme.typography, headingFont: v } })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map(f => (
                    <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Body Font</Label>
              <Select
                value={theme.typography.bodyFont}
                onValueChange={(v) => onUpdate({ typography: { ...theme.typography, bodyFont: v } })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map(f => (
                    <SelectItem key={f.name} value={f.name}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Layout */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Layout className="w-4 h-4" /> Layout
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Border Radius</Label>
              <Input
                value={theme.layout.borderRadius}
                onChange={(e) => onUpdate({ layout: { ...theme.layout, borderRadius: e.target.value } })}
              />
            </div>
            <div>
              <Label className="text-xs">Section Padding</Label>
              <Input
                value={theme.layout.sectionPadding}
                onChange={(e) => onUpdate({ layout: { ...theme.layout, sectionPadding: e.target.value } })}
              />
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}
