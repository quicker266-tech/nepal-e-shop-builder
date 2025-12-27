/**
 * ============================================================================
 * EDITOR HEADER COMPONENT
 * ============================================================================
 * 
 * Top navigation bar for the store builder editor.
 * Contains: page title, preview mode toggles, zoom controls, publish button.
 * 
 * ============================================================================
 */

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Monitor,
  Tablet,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Eye,
  ArrowLeft,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { EditorState, StorePage } from '../types';

interface EditorHeaderProps {
  store: {
    id: string;
    name: string;
    slug: string;
  };
  activePage: StorePage | null;
  editorState: EditorState;
  setEditorState: (state: EditorState) => void;
  onPublish: () => void;
}

export function EditorHeader({
  store,
  activePage,
  editorState,
  setEditorState,
  onPublish,
}: EditorHeaderProps) {
  const handleZoom = (delta: number) => {
    const newZoom = Math.max(50, Math.min(150, editorState.zoom + delta));
    setEditorState({ ...editorState, zoom: newZoom });
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-4">
      {/* Left: Back button and page info */}
      <div className="flex items-center gap-4">
        <Link to="/dashboard/settings">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{store.name}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">
            {activePage?.title || 'No page selected'}
          </span>
          {activePage?.is_published ? (
            <Badge variant="secondary" className="ml-2 bg-success/10 text-success border-success/20">
              <Check className="w-3 h-3 mr-1" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline" className="ml-2">
              Draft
            </Badge>
          )}
        </div>
      </div>

      {/* Center: Preview mode toggles */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Button
          variant={editorState.previewMode === 'desktop' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setEditorState({ ...editorState, previewMode: 'desktop' })}
          className="gap-1.5"
        >
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">Desktop</span>
        </Button>
        <Button
          variant={editorState.previewMode === 'tablet' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setEditorState({ ...editorState, previewMode: 'tablet' })}
          className="gap-1.5"
        >
          <Tablet className="w-4 h-4" />
          <span className="hidden sm:inline">Tablet</span>
        </Button>
        <Button
          variant={editorState.previewMode === 'mobile' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setEditorState({ ...editorState, previewMode: 'mobile' })}
          className="gap-1.5"
        >
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Mobile</span>
        </Button>
      </div>

      {/* Right: Zoom and actions */}
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 border rounded-lg px-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleZoom(-10)}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground w-12 text-center">
            {editorState.zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleZoom(10)}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        {/* Preview button */}
        <a
          href={`/store/${store.slug}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="outline" className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
            <ExternalLink className="w-3 h-3" />
          </Button>
        </a>

        {/* Publish button */}
        <Button onClick={onPublish} className="gap-2">
          {activePage?.is_published ? (
            <>
              <Check className="w-4 h-4" />
              Update
            </>
          ) : (
            'Publish'
          )}
        </Button>
      </div>
    </header>
  );
}
