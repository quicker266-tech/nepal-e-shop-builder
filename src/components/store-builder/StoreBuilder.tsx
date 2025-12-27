/**
 * ============================================================================
 * STORE BUILDER - MAIN EDITOR COMPONENT
 * ============================================================================
 * 
 * This is the primary entry point for the Store Builder visual editor.
 * It provides a full-featured page editor with:
 * - Live preview
 * - Drag-and-drop section reordering
 * - Section configuration panels
 * - Theme customization
 * - Responsive preview modes
 * 
 * ARCHITECTURE:
 * - StoreBuilder: Main container with sidebar and preview
 * - SectionPalette: Draggable section types to add
 * - SectionList: Current page sections with drag reorder
 * - SectionEditor: Configuration panel for selected section
 * - PreviewFrame: Live preview of the storefront
 * 
 * ============================================================================
 */

import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { useStorePages, usePageSections, useStoreTheme } from '@/hooks/useStoreBuilder';
import { StorePage, PageSection, EditorState } from './types';
import { SectionPalette } from './editor/SectionPalette';
import { SectionList } from './editor/SectionList';
import { SectionEditor } from './editor/SectionEditor';
import { PageManager } from './editor/PageManager';
import { ThemeEditor } from './editor/ThemeEditor';
import { PreviewFrame } from './editor/PreviewFrame';
import { EditorHeader } from './editor/EditorHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

export function StoreBuilder() {
  const { currentStore } = useStore();
  const { pages, loading: pagesLoading, createPage, updatePage, deletePage } = useStorePages(currentStore?.id);
  const { theme, loading: themeLoading, updateTheme } = useStoreTheme(currentStore?.id);
  
  // Editor state
  const [activePage, setActivePage] = useState<StorePage | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    selectedSectionId: null,
    isDragging: false,
    previewMode: 'desktop',
    showGrid: false,
    zoom: 100,
  });
  const [activeTab, setActiveTab] = useState<'sections' | 'theme' | 'pages'>('sections');

  // Get sections for the active page
  const {
    sections,
    loading: sectionsLoading,
    addSection,
    updateSection,
    updateSectionConfig,
    deleteSection,
    reorderSections,
    duplicateSection,
  } = usePageSections(activePage?.id, currentStore?.id);

  // Set first page as active when pages load
  useEffect(() => {
    if (pages.length > 0 && !activePage) {
      const homepage = pages.find(p => p.page_type === 'homepage');
      setActivePage(homepage || pages[0]);
    }
  }, [pages, activePage]);

  // Create homepage if no pages exist
  useEffect(() => {
    if (!pagesLoading && pages.length === 0 && currentStore?.id) {
      createPage({
        title: 'Homepage',
        slug: 'home',
        page_type: 'homepage',
        is_published: true,
      });
    }
  }, [pagesLoading, pages.length, currentStore?.id, createPage]);

  const selectedSection = sections.find(s => s.id === editorState.selectedSectionId);

  if (pagesLoading || themeLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Please select a store to edit.</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-muted/30 overflow-hidden">
      {/* Editor Header */}
      <EditorHeader
        store={currentStore}
        activePage={activePage}
        editorState={editorState}
        setEditorState={setEditorState}
        onPublish={() => activePage && updatePage(activePage.id, { is_published: true })}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Section Management */}
        <aside className="w-80 bg-background border-r border-border flex flex-col">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-3 m-2 mb-0">
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="theme">Theme</TabsTrigger>
              <TabsTrigger value="pages">Pages</TabsTrigger>
            </TabsList>

            <TabsContent value="sections" className="flex-1 overflow-hidden m-0 flex flex-col">
              {/* Section Palette - Add new sections */}
              <SectionPalette onAddSection={addSection} />
              
              {/* Section List - Current page sections */}
              <div className="flex-1 overflow-auto border-t">
                <SectionList
                  sections={sections}
                  selectedSectionId={editorState.selectedSectionId}
                  onSelectSection={(id) => setEditorState({ ...editorState, selectedSectionId: id })}
                  onReorder={reorderSections}
                  onDelete={deleteSection}
                  onDuplicate={duplicateSection}
                  onToggleVisibility={(id) => {
                    const section = sections.find(s => s.id === id);
                    if (section) {
                      updateSection(id, { is_visible: !section.is_visible });
                    }
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="theme" className="flex-1 overflow-auto m-0">
              {theme && (
                <ThemeEditor
                  theme={theme}
                  onUpdate={updateTheme}
                />
              )}
            </TabsContent>

            <TabsContent value="pages" className="flex-1 overflow-auto m-0">
              <PageManager
                pages={pages}
                activePage={activePage}
                onSelectPage={setActivePage}
                onCreatePage={createPage}
                onUpdatePage={updatePage}
                onDeletePage={deletePage}
              />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 bg-muted/50 overflow-hidden flex flex-col">
          <PreviewFrame
            store={currentStore}
            theme={theme}
            sections={sections}
            previewMode={editorState.previewMode}
            zoom={editorState.zoom}
            selectedSectionId={editorState.selectedSectionId}
            onSelectSection={(id) => setEditorState({ ...editorState, selectedSectionId: id })}
          />
        </main>

        {/* Right Sidebar - Section Configuration */}
        {selectedSection && (
          <aside className="w-80 bg-background border-l border-border overflow-auto">
            <SectionEditor
              section={selectedSection}
              onUpdate={(updates) => updateSectionConfig(selectedSection.id, updates)}
              onClose={() => setEditorState({ ...editorState, selectedSectionId: null })}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

export default StoreBuilder;
