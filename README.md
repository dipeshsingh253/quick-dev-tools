# QuickDevTools

A comprehensive suite of developer tools built with React, Vite, and TypeScript. QuickDevTools provides essential utilities for developers including config formatting, markdown preview, git diff visualization, and image beautification.

## Features

QuickDevTools provides 11 essential developer tools in a single, fast, and privacy-focused application.

### 1. Config Formatter
- **Auto-detection**: Automatically detects JSON or YAML format
- **Bidirectional Conversion**: Convert between JSON and YAML
- **Syntax Highlighting**: Monaco editor with full syntax highlighting
- **Linting**: Real-time error detection and display
- **Copy to Clipboard**: One-click copy for formatted output
- **Split View**: Resizable input and output panels

### 2. Markdown Preview
- **Three Modes**: Edit, Split, and Preview modes
- **Live Preview**: Real-time markdown rendering
- **Sync Scrolling**: Synchronized scrolling in split mode
- **GitHub Flavored Markdown**: Full GFM support
- **Syntax Highlighting**: Code blocks with syntax highlighting

### 3. Git Diff
- **Dual View Modes**: Unified and split diff views
- **Language Detection**: Auto-detects programming language
- **Syntax Highlighting**: Support for Python, JavaScript, TypeScript, HTML, CSS, Java, C, and C++
- **Keyboard Shortcuts**: 
  - `Ctrl + Enter` to compare
  - `Esc` to edit
- **GitHub-style**: Matches GitHub's diff visualization

### 4. Image Beautifier
- **Background Options**: Solid colors or gradients
- **Customizable**: Border radius, padding, gradient rotation
- **Live Preview**: Real-time preview of beautified images
- **Download**: Export beautified images as PNG
- **Perfect for Social Media**: Ideal for sharing screenshots on X, LinkedIn, etc.

### 5. Regex Checker
- **Pattern Testing**: Test regular expressions against any text
- **Flag Support**: All regex flags (g, i, m, s, u, y) with descriptions
- **Highlighted Matches**: Visual highlighting of all matches in test string
- **Match Details**: Captured groups, positions, and match lengths
- **Real-time Validation**: Instant error detection for invalid patterns
- **Debounced Input**: Efficient matching with 300ms debounce

### 6. Decoder/Encoder
- **Auto-detection**: Automatically detects Base64, URL-encoded, or JWT format
- **Bidirectional**: Encode to Base64/URL or decode from various formats
- **JWT Support**: Decodes JSON Web Tokens showing header and payload
- **Multiple Formats**: Supports Base64, URL-encoded, and double URL-encoded
- **Format Indicators**: Visual indicators showing detected or selected encoding type
- **Error Handling**: Clear error messages for invalid inputs

### 7. Text Case Converter
- **Multiple Case Types**: Convert between camelCase, snake_case, kebab-case, PascalCase, etc.
- **Instant Conversion**: Real-time conversion as you type
- **Copy to Clipboard**: Quick copy for each case type
- **Visual Preview**: See all case conversions at once

### 8. Timestamp Converter
- **Multiple Formats**: Unix timestamp, ISO 8601, RFC 2822, and human-readable
- **Timezone Support**: Convert to different timezones
- **Bidirectional**: Convert from any format to any other format
- **Real-time Parsing**: Instant validation and conversion
- **Current Time**: Quick insertion of current timestamp in any format

### 9. UUID/Hash Generator
- **UUID Generation**: Generate version 4 UUIDs
- **SHA-256 Hash**: Generate SHA-256 hashes for any input
- **Copy Functionality**: One-click copy for generated values
- **Input Validation**: Real-time validation of input for hashing

### 10. URL Inspector
- **URL Parsing**: Break down URLs into components (protocol, host, path, query, hash)
- **Query Parameters**: Extract and display all query parameters
- **Hash Fragment**: Show and copy URL fragments
- **Validation**: Validate URL format and structure
- **Visual Breakdown**: Clear visual representation of URL parts

### 11. Color Utility
- **Automatic Conversion**: Paste HEX, RGB(A), or HSL(A) and instantly see all formats
- **Color Picker**: Visually pick a color and preview the converted values
- **Copy Ready**: One-click copy for each supported format

## Tech Stack

### Core Framework
- **React 19** - Modern React with latest features including improved rendering and server components support
- **Vite 7.x** - Lightning-fast build tool and dev server with HMR
- **TypeScript 5.9** - Type-safe development with full IntelliSense

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS framework with CSS-first configuration
- **PostCSS** - CSS transformation tool used with Tailwind
- **Lucide React** - Beautiful, consistent icon library
- **clsx** - Utility for constructing className strings conditionally
- **react-color** - Color picker component for image beautifier

### Code Editing & Parsing
- **Monaco Editor (@monaco-editor/react)** - Same editor that powers VS Code
- **js-yaml** - YAML parser and dumper for config formatting
- **json5** - JSON5 parser for extended JSON syntax support

### Markdown & Text Processing
- **react-markdown** - Markdown renderer for React
- **remark-gfm** - GitHub Flavored Markdown support (tables, strikethrough, etc.)

### Diff & Comparison
- **react-diff-viewer-continued** - Beautiful diff viewer with unified and split views
- **languageDetector** - Custom utility for auto-detecting programming languages

### Image Processing
- **html2canvas** - Takes screenshots of DOM elements for image export

### Layout & UI Components
- **react-resizable-panels** - Resizable split panels for multi-pane views

### Development Tools
- **ESLint 9.x** - Code linting and formatting
- **TypeScript ESLint** - TypeScript-specific linting rules
- **Vite Plugin React** - React support for Vite with Fast Refresh

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quickdevtools

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Keyboard Shortcuts

- `Ctrl/Cmd + 1`: Switch to Config Formatter
- `Ctrl/Cmd + 2`: Switch to Markdown Preview
- `Ctrl/Cmd + 3`: Switch to Git Diff
- `Ctrl/Cmd + 4`: Switch to Regex Checker
- `Ctrl/Cmd + 5`: Switch to Decoder/Encoder
- `Ctrl/Cmd + 6`: Switch to Text Case Converter
- `Ctrl/Cmd + 7`: Switch to Timestamp Converter
- `Ctrl/Cmd + 8`: Switch to UUID/Hash Generator
- `Ctrl/Cmd + 9`: Switch to URL Inspector
- `Ctrl/Cmd + 0`: Switch to Image Beautifier
- Color Utility: Accessible from the sidebar (Ctrl/Cmd + 0-9 are already assigned)
- `Ctrl + Enter` (Git Diff): Compare texts
- `Esc` (Git Diff): Return to edit mode

## Theme

QuickDevTools features a GitHub-inspired theme with both light and dark modes. The theme automatically detects your system preference and can be toggled using the theme button in the sidebar.

## Project Structure

```
quickdevtools/
├── src/                          # Source code directory
│   ├── components/               # React components
│   │   ├── ConfigFormatter/      # JSON/YAML converter and formatter
│   │   │   └── ConfigFormatter.tsx
│   │   ├── MarkdownPreview/      # Markdown editor and preview
│   │   │   └── MarkdownPreview.tsx
│   │   ├── GitDiff/              # Git diff visualization tool
│   │   │   └── GitDiff.tsx
│   │   ├── RegexChecker/         # Regular expression testing tool
│   │   │   └── RegexChecker.tsx
│   │   ├── Decoder/              # Base64/URL/JWT encoder and decoder
│   │   │   └── Decoder.tsx
│   │   ├── TextCaseConverter/    # Text case conversion utility
│   │   │   └── TextCaseConverter.tsx
│   │   ├── TimestampConverter/   # Timestamp format converter
│   │   │   └── TimestampConverter.tsx
│   │   ├── UuidHashGenerator/    # UUID and hash generator
│   │   │   └── UuidHashGenerator.tsx
│   │   ├── UrlInspector/         # URL parsing and inspection tool
│   │   │   └── UrlInspector.tsx
│   │   ├── ImageBeautifier/      # Screenshot beautification tool
│   │   │   └── ImageBeautifier.tsx
│   │   ├── ColorUtility/         # Color converter and picker tool
│   │   │   └── ColorUtility.tsx
│   │   └── Sidebar/              # Navigation sidebar component
│   │       └── Sidebar.tsx
│   ├── context/                  # React context providers
│   │   └── ThemeContext.tsx      # Theme management (light/dark mode)
│   ├── utils/                    # Utility functions
│   │   ├── configParser.ts       # JSON/YAML parsing utilities
│   │   └── languageDetector.ts   # Programming language detection
│   ├── types/                    # TypeScript type definitions
│   │   └── index.ts              # All type definitions for the app
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Application entry point
│   ├── App.css                   # App-specific styles
│   └── index.css                 # Global styles and Tailwind imports
├── public/                       # Static assets
│   └── vite.svg                  # Vite logo
├── index.html                    # HTML template
├── package.json                  # Project dependencies and scripts
├── package-lock.json             # Dependency lock file
├── tsconfig.json                 # TypeScript configuration
├── tsconfig.app.json             # TypeScript config for app code
├── tsconfig.node.json            # TypeScript config for node code
├── vite.config.ts                # Vite build configuration
├── eslint.config.js              # ESLint configuration
├── postcss.config.js             # PostCSS configuration (Tailwind)
├── firebase.json                 # Firebase deployment configuration
├── .firebaserc                   # Firebase project settings
└── .gitignore                    # Git ignore rules
```

### File Descriptions

#### Core Application Files
- **`src/App.tsx`** - Main application component that manages tool switching and routing
- **`src/main.tsx`** - Application entry point that renders the React app
- **`src/index.css`** - Global styles with Tailwind CSS imports and custom theme variables

#### Component Files
Each tool component follows a consistent pattern:
- Manages its own state using React hooks
- Persists state to localStorage for user data persistence
- Implements keyboard shortcuts for quick access
- Follows the GitHub-inspired dark/light theme
- Provides instant feedback and validation

#### Type Definitions (`src/types/index.ts`)
- `ToolType` - Union type of all available tools
- `Theme` - Theme type ('light' | 'dark')
- State interfaces for each tool (e.g., `ConfigFormatterState`, `RegexCheckerState`)

#### Configuration Files
- **`vite.config.ts`** - Vite configuration with React plugin and path aliases
- **`tsconfig.json`** - Root TypeScript configuration
- **`eslint.config.js`** - ESLint rules for code quality
- **`postcss.config.js`** - PostCSS configuration for Tailwind CSS v4

#### Deployment Files
- **`firebase.json`** - Firebase Hosting configuration
- **`.firebaserc`** - Firebase project aliases and settings

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- Code editing powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)
