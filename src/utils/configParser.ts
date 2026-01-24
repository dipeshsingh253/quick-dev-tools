import YAML from 'js-yaml';
import JSON5 from 'json5';
import type { ConfigFormat } from '../types';

export const detectFormat = (input: string): ConfigFormat => {
  const trimmed = input.trim();
  if (!trimmed) return 'json';
  
  // Check if it starts with typical JSON characters
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }
  
  return 'yaml';
};

export const formatJSON = (input: string): string => {
  const trimmed = input.trim();
  
  // Try parsing as JSON first
  try {
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed, null, 2);
  } catch {
    // Try JSON5 (allows trailing commas, comments, etc.)
    try {
      const parsed = JSON5.parse(trimmed);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // Try as YAML and convert to JSON
      try {
        const parsed = YAML.load(trimmed);
        return JSON.stringify(parsed, null, 2);
      } catch (error) {
        throw new Error('Invalid input: ' + (error as Error).message);
      }
    }
  }
};

export const formatYAML = (input: string): string => {
  const trimmed = input.trim();
  
  // Try parsing as JSON first
  try {
    const parsed = JSON.parse(trimmed);
    return YAML.dump(parsed, { indent: 2, lineWidth: -1 });
  } catch {
    // Try JSON5
    try {
      const parsed = JSON5.parse(trimmed);
      return YAML.dump(parsed, { indent: 2, lineWidth: -1 });
    } catch {
      // Try as YAML
      try {
        const parsed = YAML.load(trimmed);
        return YAML.dump(parsed, { indent: 2, lineWidth: -1 });
      } catch (error) {
        throw new Error('Invalid input: ' + (error as Error).message);
      }
    }
  }
};

export const convertToYAML = formatYAML;
export const convertToJSON = formatJSON;

export const validateConfig = (input: string, format: ConfigFormat): string | null => {
  try {
    if (format === 'json') {
      JSON5.parse(input);
    } else {
      YAML.load(input);
    }
    return null;
  } catch (error) {
    return (error as Error).message;
  }
};
