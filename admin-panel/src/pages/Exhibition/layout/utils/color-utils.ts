// Color utilities for layout components

/**
 * Converts any color value to a valid 6-digit hex color
 * Backend validation requires #RRGGBB format (case insensitive)
 */
export const toHexColor = (color: string | undefined | null): string => {
  // Always return a default color if input is null, undefined, or empty
  if (!color || color.trim() === '') {
    return '#1890FF'; // Default Ant Design primary color
  }

  // If it's already a hex color, validate and normalize it
  if (color.startsWith('#')) {
    // Remove the # for processing
    const hex = color.slice(1);
    
    // If it's a 3-digit hex, expand to 6 digits
    if (hex.length === 3 && /^[0-9A-Fa-f]{3}$/.test(hex)) {
      return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toUpperCase();
    }
    
    // If it's a valid 6-digit hex, return it normalized
    if (hex.length === 6 && /^[0-9A-Fa-f]{6}$/.test(hex)) {
      return `#${hex.toUpperCase()}`;
    }
  }

  // Handle named colors by converting to hex
  const namedColors: Record<string, string> = {
    'red': '#FF0000',
    'blue': '#0000FF',
    'green': '#008000',
    'yellow': '#FFFF00',
    'orange': '#FFA500',
    'purple': '#800080',
    'pink': '#FFC0CB',
    'brown': '#A52A2A',
    'black': '#000000',
    'white': '#FFFFFF',
    'gray': '#808080',
    'grey': '#808080',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'lime': '#00FF00',
    'navy': '#000080',
    'teal': '#008080',
    'olive': '#808000',
    'maroon': '#800000',
    'silver': '#C0C0C0',
  };

  const lowerColor = color.toLowerCase();
  if (namedColors[lowerColor]) {
    return namedColors[lowerColor];
  }

  // Try to parse RGB/RGBA values
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, parseInt(rgbMatch[1])));
    const g = Math.max(0, Math.min(255, parseInt(rgbMatch[2])));
    const b = Math.max(0, Math.min(255, parseInt(rgbMatch[3])));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`.toUpperCase();
  }

  // Default fallback color - ensure we never return null/undefined
  return '#1890FF';
};

/**
 * Validates if a string is a valid hex color
 */
export const isValidHexColor = (color: string): boolean => {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
};

/**
 * Generates a random hex color
 */
export const generateRandomHexColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

/**
 * Lightens a hex color by a percentage
 */
export const lightenHexColor = (hex: string, percent: number): string => {
  const validHex = toHexColor(hex);
  const num = parseInt(validHex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return `#${(0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}; 