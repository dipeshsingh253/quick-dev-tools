export type ToolType = 'config' | 'markdown' | 'diff' | 'image' | 'regex' | 'decoder' | 'timestamp' | 'generator' | 'case' | 'url';

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

export interface RegexCheckerState {
  pattern: string;
  testString: string;
  flags: {
    g: boolean;
    i: boolean;
    m: boolean;
    s: boolean;
    u: boolean;
    y: boolean;
  };
}

export interface DecoderState {
  input: string;
  detectedType: string | null;
  decodedOutput: string;
  error: string | null;
}

export interface TimestampConverterState {
  input: string;
  targetFormat: 'unix' | 'iso' | 'rfc' | 'human';
  targetTimezone: string;
}

export interface UuidHashGeneratorState {
  uuid: string;
  sha256: string;
  hashInput: string;
}

export interface TextCaseConverterState {
  input: string;
}

export interface UrlInspectorState {
  input: string;
}
