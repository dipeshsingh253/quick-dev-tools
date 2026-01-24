# QuickDevTools

A comprehensive suite of developer tools built with React, Vite, and TypeScript. QuickDevTools provides essential utilities for developers including config formatting, markdown preview, git diff visualization, and image beautification.

## Features

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

## Tech Stack

- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 (CSS-first configuration)
- **Code Editor**: Monaco Editor
- **Markdown**: react-markdown + remark-gfm
- **Diff Viewer**: react-diff-viewer-continued
- **Image Processing**: html2canvas
- **Icons**: Lucide React
- **Config Parsing**: js-yaml, json5

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
- `Ctrl/Cmd + 4`: Switch to Image Beautifier
- `Ctrl + Enter` (Git Diff): Compare texts
- `Esc` (Git Diff): Return to edit mode

## Theme

QuickDevTools features a GitHub-inspired theme with both light and dark modes. The theme automatically detects your system preference and can be toggled using the theme button in the sidebar.

## Project Structure

```
quickdevtools/
├── src/
│   ├── components/
│   │   ├── ConfigFormatter/
│   │   ├── MarkdownPreview/
│   │   ├── GitDiff/
│   │   ├── ImageBeautifier/
│   │   └── Sidebar/
│   ├── context/
│   │   └── ThemeContext.tsx
│   ├── utils/
│   │   ├── configParser.ts
│   │   └── languageDetector.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── postcss.config.js
├── vite.config.ts
└── package.json
```

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
