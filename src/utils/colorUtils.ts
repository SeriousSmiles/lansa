
/**
 * Utility functions for color manipulation and contrast calculations
 */

/**
 * Calculates whether black or white text should be used based on background color
 * @param hexColor - Hex color code (e.g. "#FF6B4A")
 * @returns "#000000" for dark text on light backgrounds or "#FFFFFF" for light text on dark backgrounds
 */
export const getContrastTextColor = (hexColor: string): string => {
  if (!hexColor || hexColor.length < 7) return "#000000";
  
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance - standard formula for brightness
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors and white for dark colors
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
 * Generates a set of theme colors based on a primary color
 * @param primaryColor - The main hex color 
 * @returns Object containing different variations of the color for use in UI
 */
export const generateThemeColors = (primaryColor: string) => {
  return {
    primary: primaryColor,
    light: `${primaryColor}15`, // Very light version (15% opacity)
    medium: `${primaryColor}30`, // Medium light version (30% opacity)
    border: `${primaryColor}50`, // Border color (50% opacity) 
    text: primaryColor,          // Text using the primary color
  };
};
