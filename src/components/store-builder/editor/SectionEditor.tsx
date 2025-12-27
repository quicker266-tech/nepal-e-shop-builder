/**
 * ============================================================================
 * SECTION EDITOR COMPONENT
 * ============================================================================
 * 
 * Configuration panel for editing section properties.
 * Dynamically renders form fields based on section type.
 * 
 * ============================================================================
 */

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Image as ImageIcon, Link as LinkIcon, Type, Settings } from 'lucide-react';
import { PageSection, SectionConfig, HeroBannerConfig, FeaturedProductsConfig, TextBlockConfig } from '../types';
import { SECTION_DEFINITIONS } from '../constants';

interface SectionEditorProps {
  section: PageSection;
  onUpdate: (config: SectionConfig) => void;
  onClose: () => void;
}

export function SectionEditor({ section, onUpdate, onClose }: SectionEditorProps) {
  const definition = SECTION_DEFINITIONS[section.section_type];
  const config = section.config;

  const updateField = (field: string, value: any) => {
    onUpdate({ ...config, [field]: value });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{section.name}</h3>
          <p className="text-xs text-muted-foreground">{definition?.label}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Render fields based on section type */}
          {renderSectionFields(section.section_type, config, updateField)}
        </div>
      </ScrollArea>
    </div>
  );
}

// ============================================================================
// FIELD RENDERERS BY SECTION TYPE
// ============================================================================

function renderSectionFields(
  sectionType: string,
  config: SectionConfig,
  updateField: (field: string, value: any) => void
) {
  switch (sectionType) {
    case 'hero_banner':
      return <HeroBannerFields config={config as HeroBannerConfig} updateField={updateField} />;
    case 'featured_products':
    case 'new_arrivals':
    case 'best_sellers':
      return <ProductGridFields config={config as FeaturedProductsConfig} updateField={updateField} />;
    case 'text_block':
      return <TextBlockFields config={config as TextBlockConfig} updateField={updateField} />;
    default:
      return <GenericFields config={config} updateField={updateField} />;
  }
}

// ============================================================================
// HERO BANNER FIELDS
// ============================================================================

function HeroBannerFields({
  config,
  updateField,
}: {
  config: HeroBannerConfig;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <>
      {/* Content Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Type className="w-4 h-4" />
          Content
        </div>
        
        <div className="space-y-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={config.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Enter headline..."
            />
          </div>
          
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Textarea
              id="subtitle"
              value={config.subtitle || ''}
              onChange={(e) => updateField('subtitle', e.target.value)}
              placeholder="Enter subtitle..."
              rows={2}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* CTA Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <LinkIcon className="w-4 h-4" />
          Call to Action
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="buttonText">Button Text</Label>
            <Input
              id="buttonText"
              value={config.buttonText || ''}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="Shop Now"
            />
          </div>
          <div>
            <Label htmlFor="buttonLink">Button Link</Label>
            <Input
              id="buttonLink"
              value={config.buttonLink || ''}
              onChange={(e) => updateField('buttonLink', e.target.value)}
              placeholder="/products"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="secondaryButtonText">Secondary Button</Label>
            <Input
              id="secondaryButtonText"
              value={config.secondaryButtonText || ''}
              onChange={(e) => updateField('secondaryButtonText', e.target.value)}
              placeholder="Learn More"
            />
          </div>
          <div>
            <Label htmlFor="secondaryButtonLink">Secondary Link</Label>
            <Input
              id="secondaryButtonLink"
              value={config.secondaryButtonLink || ''}
              onChange={(e) => updateField('secondaryButtonLink', e.target.value)}
              placeholder="/about"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Background Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <ImageIcon className="w-4 h-4" />
          Background
        </div>
        
        <div>
          <Label htmlFor="backgroundImage">Image URL</Label>
          <Input
            id="backgroundImage"
            value={config.backgroundImage || ''}
            onChange={(e) => updateField('backgroundImage', e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div>
          <Label htmlFor="backgroundOverlay">Overlay Opacity ({config.backgroundOverlay || 0}%)</Label>
          <input
            type="range"
            id="backgroundOverlay"
            min="0"
            max="100"
            value={config.backgroundOverlay || 0}
            onChange={(e) => updateField('backgroundOverlay', parseInt(e.target.value))}
            className="w-full"
          />
        </div>
      </div>

      <Separator />

      {/* Layout Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings className="w-4 h-4" />
          Layout
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Text Alignment</Label>
            <Select
              value={config.textAlignment || 'center'}
              onValueChange={(v) => updateField('textAlignment', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Height</Label>
            <Select
              value={config.height || 'large'}
              onValueChange={(v) => updateField('height', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (40vh)</SelectItem>
                <SelectItem value="medium">Medium (60vh)</SelectItem>
                <SelectItem value="large">Large (80vh)</SelectItem>
                <SelectItem value="full">Full Screen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// PRODUCT GRID FIELDS
// ============================================================================

function ProductGridFields({
  config,
  updateField,
}: {
  config: FeaturedProductsConfig;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Section Title</Label>
          <Input
            id="title"
            value={config.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Featured Products"
          />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={config.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Check out our best sellers"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Settings className="w-4 h-4" />
          Display Options
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Products to Show</Label>
            <Select
              value={String(config.productCount || 4)}
              onValueChange={(v) => updateField('productCount', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 Products</SelectItem>
                <SelectItem value="6">6 Products</SelectItem>
                <SelectItem value="8">8 Products</SelectItem>
                <SelectItem value="12">12 Products</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Columns</Label>
            <Select
              value={String(config.columns || 4)}
              onValueChange={(v) => updateField('columns', parseInt(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2 Columns</SelectItem>
                <SelectItem value="3">3 Columns</SelectItem>
                <SelectItem value="4">4 Columns</SelectItem>
                <SelectItem value="5">5 Columns</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="showPrice">Show Prices</Label>
            <Switch
              id="showPrice"
              checked={config.showPrice !== false}
              onCheckedChange={(v) => updateField('showPrice', v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="showAddToCart">Show Add to Cart</Label>
            <Switch
              id="showAddToCart"
              checked={config.showAddToCart !== false}
              onCheckedChange={(v) => updateField('showAddToCart', v)}
            />
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// TEXT BLOCK FIELDS
// ============================================================================

function TextBlockFields({
  config,
  updateField,
}: {
  config: TextBlockConfig;
  updateField: (field: string, value: any) => void;
}) {
  return (
    <>
      <div className="space-y-4">
        <div>
          <Label htmlFor="content">Content</Label>
          <Textarea
            id="content"
            value={config.content || ''}
            onChange={(e) => updateField('content', e.target.value)}
            placeholder="Enter your content..."
            rows={8}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Supports basic HTML formatting
          </p>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Alignment</Label>
            <Select
              value={config.alignment || 'left'}
              onValueChange={(v) => updateField('alignment', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Max Width</Label>
            <Select
              value={config.maxWidth || 'medium'}
              onValueChange={(v) => updateField('maxWidth', v)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="full">Full Width</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// GENERIC FIELDS (fallback for unsupported section types)
// ============================================================================

function GenericFields({
  config,
  updateField,
}: {
  config: SectionConfig;
  updateField: (field: string, value: any) => void;
}) {
  const entries = Object.entries(config as Record<string, unknown>);

  if (entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No configurable options for this section type.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => {
        if (typeof value === 'string') {
          return (
            <div key={key}>
              <Label htmlFor={key}>{formatLabel(key)}</Label>
              <Input
                id={key}
                value={value}
                onChange={(e) => updateField(key, e.target.value)}
              />
            </div>
          );
        }
        if (typeof value === 'number') {
          return (
            <div key={key}>
              <Label htmlFor={key}>{formatLabel(key)}</Label>
              <Input
                id={key}
                type="number"
                value={value}
                onChange={(e) => updateField(key, parseInt(e.target.value))}
              />
            </div>
          );
        }
        if (typeof value === 'boolean') {
          return (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={key}>{formatLabel(key)}</Label>
              <Switch
                id={key}
                checked={value}
                onCheckedChange={(v) => updateField(key, v)}
              />
            </div>
          );
        }
        return null;
      })}
    </div>
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
