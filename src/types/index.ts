export type ToolType = 'config' | 'markdown' | 'diff' | 'image';

export type Theme = 'light' | 'dark';

export type ConfigFormat = 'json' | 'yaml';

export type MarkdownMode = 'edit' | 'split' | 'preview';

export type DiffMode = 'unified' | 'split';

export type DiffView = 'input' | 'diff';

export interface ConfigFormatterState {
  input: string;
  output: string;
  format: ConfigFormat;
  error: string | null;
}

export interface MarkdownPreviewState {
  content: string;
  mode: MarkdownMode;
}

export interface GitDiffState {
  original: string;
  modified: string;
  view: DiffView;
  diffMode: DiffMode;
}

export interface ImageBeautifierState {
  image: string | null;
  backgroundColor: string;
  gradientColor1: string;
  gradientColor2: string;
  useGradient: boolean;
  gradientRotation: number;
  borderRadius: number;
  padding: number;
}
