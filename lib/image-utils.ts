/**
 * Image utility functions for safely handling images in the application
 * This provides consistent fallbacks when images fail to load
 */

/**
 * Categories with their corresponding colors and gradients
 */
export const CATEGORY_STYLES = {
  technology: {
    gradient: 'from-blue-100 to-blue-200 dark:from-blue-950 dark:to-blue-900',
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/20',
  },
  business: {
    gradient: 'from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-emerald-900',
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/20',
  },
  entertainment: {
    gradient: 'from-pink-100 to-pink-200 dark:from-pink-950 dark:to-pink-900',
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-500/20',
  },
  health: {
    gradient: 'from-teal-100 to-teal-200 dark:from-teal-950 dark:to-teal-900',
    iconColor: 'text-teal-500',
    bgColor: 'bg-teal-500/20',
  },
  science: {
    gradient: 'from-purple-100 to-purple-200 dark:from-purple-950 dark:to-purple-900',
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/20',
  },
  sports: {
    gradient: 'from-red-100 to-red-200 dark:from-red-950 dark:to-red-900',
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/20',
  },
  general: {
    gradient: 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900',
    iconColor: 'text-slate-500',
    bgColor: 'bg-slate-500/20',
  },
};

/**
 * Get a fallback image URL for a category
 * @param category The article category
 * @returns A URL to an image related to the category
 */
export function getFallbackImageUrl(category: string | undefined): string {
  const normalizedCategory = normalizeCategory(category);

  // Use Unsplash source for reliable category-based images
  return `https://source.unsplash.com/featured/?${normalizedCategory},news`;
}

/**
 * Get the gradient style for a category
 * @param category The article category
 * @returns The tailwind gradient classes
 */
export function getCategoryGradient(category: string | undefined): string {
  const normalizedCategory = normalizeCategory(category);
  return CATEGORY_STYLES[normalizedCategory]?.gradient || CATEGORY_STYLES.general.gradient;
}

/**
 * Get the icon color for a category
 * @param category The article category
 * @returns The tailwind text color class
 */
export function getCategoryIconColor(category: string | undefined): string {
  const normalizedCategory = normalizeCategory(category);
  return CATEGORY_STYLES[normalizedCategory]?.iconColor || CATEGORY_STYLES.general.iconColor;
}

/**
 * Get the background color for a category
 * @param category The article category
 * @returns The tailwind background color class
 */
export function getCategoryBgColor(category: string | undefined): string {
  const normalizedCategory = normalizeCategory(category);
  return CATEGORY_STYLES[normalizedCategory]?.bgColor || CATEGORY_STYLES.general.bgColor;
}

/**
 * Normalize a category string to match our defined categories
 * @param category The category string to normalize
 * @returns A normalized category key
 */
function normalizeCategory(category: string | undefined): keyof typeof CATEGORY_STYLES {
  if (!category) return 'general';

  const normalized = category.toLowerCase().trim();

  // Check if the normalized category is one of our defined categories
  if (normalized in CATEGORY_STYLES) {
    return normalized as keyof typeof CATEGORY_STYLES;
  }

  // Handle common variations
  if (normalized.includes('tech')) return 'technology';
  if (normalized.includes('biz') || normalized.includes('econ')) return 'business';
  if (normalized.includes('entertain') || normalized.includes('celeb')) return 'entertainment';
  if (normalized.includes('health') || normalized.includes('medical')) return 'health';
  if (normalized.includes('sci')) return 'science';
  if (normalized.includes('sport')) return 'sports';

  // Default fallback
  return 'general';
}

/**
 * Generate a deterministic color based on a string
 * @param str The input string
 * @returns A hex color code
 */
export function stringToColor(str: string): string {
  if (!str) return '#6b7280'; // Default gray

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
}

/**
 * Get a reliable, hardcoded image URL for a category
 * @param category The article category
 * @returns A URL to a high-quality image related to the category
 */
export function getCategoryImage(category: string | undefined): string {
  const normalizedCategory = normalizeCategory(category);

  // Hardcoded, reliable image URLs for each category
  const categoryImages: Record<string, string> = {
    'business': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
    'entertainment': 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    'general': 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
  };

  return categoryImages[normalizedCategory] || categoryImages['general'];
}
