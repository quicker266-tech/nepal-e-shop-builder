/**
 * PREVIEW FRAME COMPONENT
 * Live preview of the storefront with responsive modes
 */

import { PageSection, StoreTheme } from '../types';
import { cn } from '@/lib/utils';

interface PreviewFrameProps {
  store: { id: string; name: string; slug: string; logo_url?: string | null };
  theme: StoreTheme | null;
  sections: PageSection[];
  previewMode: 'desktop' | 'tablet' | 'mobile';
  zoom: number;
  selectedSectionId: string | null;
  onSelectSection: (id: string | null) => void;
}

const previewWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function PreviewFrame({
  store,
  sections,
  previewMode,
  zoom,
  selectedSectionId,
  onSelectSection,
}: PreviewFrameProps) {
  return (
    <div className="flex-1 overflow-auto p-4 flex justify-center">
      <div
        className="bg-background rounded-lg shadow-lg overflow-hidden transition-all"
        style={{
          width: previewWidths[previewMode],
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top center',
        }}
      >
        {/* Preview Header */}
        <div className="bg-card border-b p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
            {store.name.charAt(0)}
          </div>
          <span className="font-semibold">{store.name}</span>
        </div>

        {/* Sections */}
        <div className="min-h-[60vh]">
          {sections.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              Add sections to see your store preview
            </div>
          ) : (
            sections.filter(s => s.is_visible).map((section) => (
              <div
                key={section.id}
                onClick={() => onSelectSection(section.id)}
                className={cn(
                  'border-2 border-transparent cursor-pointer transition-colors',
                  selectedSectionId === section.id && 'border-primary bg-primary/5'
                )}
              >
                <SectionPreview section={section} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SectionPreview({ section }: { section: PageSection }) {
  const config = section.config as Record<string, any>;

  switch (section.section_type) {
    case 'hero_banner':
      return (
        <div
          className="relative min-h-[40vh] flex items-center justify-center p-8"
          style={{
            backgroundImage: config.backgroundImage ? `url(${config.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {config.backgroundImage && (
            <div className="absolute inset-0 bg-black" style={{ opacity: (config.backgroundOverlay || 0) / 100 }} />
          )}
          <div className={cn('relative z-10 text-center', !config.backgroundImage && 'bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl p-12')}>
            <h1 className="text-3xl font-bold mb-2">{config.title || 'Hero Title'}</h1>
            {config.subtitle && <p className="text-muted-foreground mb-4">{config.subtitle}</p>}
            {config.buttonText && (
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg">
                {config.buttonText}
              </button>
            )}
          </div>
        </div>
      );

    case 'featured_products':
    case 'new_arrivals':
    case 'best_sellers':
      return (
        <div className="p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">{config.title || section.name}</h2>
          <div className={`grid gap-4`} style={{ gridTemplateColumns: `repeat(${config.columns || 4}, 1fr)` }}>
            {Array.from({ length: config.productCount || 4 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-lg aspect-square flex items-center justify-center text-muted-foreground">
                Product {i + 1}
              </div>
            ))}
          </div>
        </div>
      );

    case 'text_block':
      return (
        <div className="p-8" style={{ textAlign: config.alignment || 'left' }}>
          <div dangerouslySetInnerHTML={{ __html: config.content || '<p>Text content here...</p>' }} />
        </div>
      );

    default:
      return (
        <div className="p-8 bg-muted/30 text-center text-muted-foreground">
          {section.name} ({section.section_type})
        </div>
      );
  }
}
