
/**
 * Utility functions for color manipulation and contrast calculations
 */

// ============= New Palette System =============

export interface ProfilePalette {
  id: string;
  name: string;
  mode: 'light' | 'dark';
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  textOnPrimary: string;
  borderDefault: string;
  borderAccent: string;
}

// Pre-built Light Mode Palettes
export const LIGHT_PALETTES: ProfilePalette[] = [
  {
    id: 'coral_professional',
    name: 'Coral Professional',
    mode: 'light',
    primary: '#FF6B4A',
    secondary: '#FF8C6B',
    background: '#FFF9F7',
    surface: '#FFFFFF',
    surfaceAlt: '#FFF5F2',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#E5E7EB',
    borderAccent: '#FF6B4A',
  },
  {
    id: 'ocean_blue',
    name: 'Ocean Blue',
    mode: 'light',
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    background: '#F0F9FF',
    surface: '#FFFFFF',
    surfaceAlt: '#E0F2FE',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#E5E7EB',
    borderAccent: '#0EA5E9',
  },
  {
    id: 'forest_sage',
    name: 'Forest Sage',
    mode: 'light',
    primary: '#10B981',
    secondary: '#34D399',
    background: '#F0FDF4',
    surface: '#FFFFFF',
    surfaceAlt: '#DCFCE7',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#E5E7EB',
    borderAccent: '#10B981',
  },
  {
    id: 'royal_purple',
    name: 'Royal Purple',
    mode: 'light',
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    background: '#FAF5FF',
    surface: '#FFFFFF',
    surfaceAlt: '#F3E8FF',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#E5E7EB',
    borderAccent: '#8B5CF6',
  },
  {
    id: 'charcoal_minimal',
    name: 'Charcoal Minimal',
    mode: 'light',
    primary: '#374151',
    secondary: '#4B5563',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    surfaceAlt: '#F3F4F6',
    textPrimary: '#1A1A1A',
    textSecondary: '#6B7280',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#E5E7EB',
    borderAccent: '#374151',
  },
];

// Pre-built Dark Mode Palettes
export const DARK_PALETTES: ProfilePalette[] = [
  {
    id: 'dark_coral',
    name: 'Dark Coral',
    mode: 'dark',
    primary: '#FF6B4A',
    secondary: '#FF8C6B',
    background: '#1A1F2C',
    surface: '#252B3B',
    surfaceAlt: '#2A3142',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#374151',
    borderAccent: '#FF6B4A',
  },
  {
    id: 'midnight_blue',
    name: 'Midnight Blue',
    mode: 'dark',
    primary: '#60A5FA',
    secondary: '#93C5FD',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceAlt: '#334155',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',
    borderDefault: '#374151',
    borderAccent: '#60A5FA',
  },
  {
    id: 'dark_emerald',
    name: 'Dark Emerald',
    mode: 'dark',
    primary: '#34D399',
    secondary: '#6EE7B7',
    background: '#1A2E2A',
    surface: '#22413B',
    surfaceAlt: '#2A4F47',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textOnPrimary: '#1A1A1A',
    borderDefault: '#374151',
    borderAccent: '#34D399',
  },
  {
    id: 'deep_purple',
    name: 'Deep Purple',
    mode: 'dark',
    primary: '#A78BFA',
    secondary: '#C4B5FD',
    background: '#1E1B2E',
    surface: '#2D2640',
    surfaceAlt: '#3A3150',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textOnPrimary: '#1A1A1A',
    borderDefault: '#374151',
    borderAccent: '#A78BFA',
  },
  {
    id: 'dark_minimal',
    name: 'Dark Minimal',
    mode: 'dark',
    primary: '#F1F0FB',
    secondary: '#E5E7EB',
    background: '#18181B',
    surface: '#27272A',
    surfaceAlt: '#3F3F46',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    textOnPrimary: '#1A1A1A',
    borderDefault: '#3F3F46',
    borderAccent: '#F1F0FB',
  },
];

export const ALL_PALETTES = [...LIGHT_PALETTES, ...DARK_PALETTES];

/**
 * Gets a palette by ID, returns default if not found
 */
export const getPaletteById = (id: string): ProfilePalette => {
  return ALL_PALETTES.find(p => p.id === id) || LIGHT_PALETTES[0];
};

/**
 * Converts hex to RGB for contrast calculations
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  if (!hex || hex.length < 7) return null;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

/**
 * Calculate relative luminance
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculate contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 1;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Get contrast level description
 */
export const getContrastLevel = (ratio: number): string => {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
};

/**
 * Calculates whether black or white text should be used based on background color
 * @param hexColor - Hex color code (e.g. "#FF6B4A")
 * @returns "#000000" for dark text on light backgrounds or "#FFFFFF" for light text on dark backgrounds
 */
export const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) return "#000000";
  
  const rgb = hexToRgb(hexColor);
  if (!rgb) return "#000000";
  
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.5 ? "#000000" : "#FFFFFF";
};

/**
 * Determines if a theme is dark based on its background color
 * @param hexColor - Hex color code
 * @returns boolean - true if the theme is dark
 */
export const isDarkTheme = (hexColor: string): boolean => {
  return getContrastTextColor(hexColor) === "#FFFFFF";
};

/**
 * Generates a set of theme colors based on a primary color (legacy support)
 * @param primaryColor - The main hex color 
 * @returns Object containing different variations of the color for use in UI
 */
export const generateThemeColors = (primaryColor: string) => {
  return {
    primary: primaryColor,
    light: `${primaryColor}15`,
    medium: `${primaryColor}30`,
    border: `${primaryColor}50`,
    text: primaryColor,
  };
};
