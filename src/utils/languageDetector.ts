export type SupportedLanguage = 'python' | 'javascript' | 'typescript' | 'html' | 'css' | 'java' | 'c' | 'cpp' | 'text';

export const detectLanguage = (code: string): SupportedLanguage => {
  const trimmed = code.trim();
  
  // Python patterns
  if (/^(def |class |import |from |if __name__|print\(|#)/m.test(trimmed)) {
    return 'python';
  }
  
  // TypeScript patterns
  if (/^(interface |type |enum |import.*from.*['"]\.ts['"]|: (string|number|boolean|any|void))/m.test(trimmed)) {
    return 'typescript';
  }
  
  // JavaScript patterns
  if (/^(const |let |var |function |=> |import |export |console\.|\/\/)/m.test(trimmed)) {
    return 'javascript';
  }
  
  // HTML patterns
  if (/^<!DOCTYPE|<html|<head|<body|<div|<span|<p|<a /m.test(trimmed)) {
    return 'html';
  }
  
  // CSS patterns
  if (/^([.#]?[a-z-]+\s*\{|@media|@import|@keyframes)/m.test(trimmed)) {
    return 'css';
  }
  
  // Java patterns
  if (/^(public |private |protected |class |interface |import java\.|package |System\.out\.println)/m.test(trimmed)) {
    return 'java';
  }
  
  // C++ patterns
  if (/^(#include|using namespace|std::|class |public:|private:|protected:|cout|cin)/m.test(trimmed)) {
    return 'cpp';
  }
  
  // C patterns
  if (/^(#include|stdio\.h|stdlib\.h|int main\(|printf\(|scanf\(|struct |typedef )/m.test(trimmed)) {
    return 'c';
  }
  
  return 'text';
};

export const getMonacoLanguage = (language: SupportedLanguage): string => {
  const languageMap: Record<SupportedLanguage, string> = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'typescript',
    html: 'html',
    css: 'css',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    text: 'plaintext'
  };
  
  return languageMap[language];
};
