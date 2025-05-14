/**
 * Custom image loader for Next.js
 * This loader handles all image loading in the application
 * It ensures that we never get 404 errors for images
 */

function getImageCategory(src) {
  // Extract category from URL if possible
  const categories = [
    'technology', 'business', 'entertainment', 
    'health', 'science', 'sports', 'general',
    'trending', 'news'
  ];
  
  const lowerSrc = src.toLowerCase();
  for (const category of categories) {
    if (lowerSrc.includes(category)) {
      return category;
    }
  }
  
  // Default to 'news' if no category found
  return 'news';
}

function generateUnsplashUrl(src, width) {
  // Extract a search term from the URL or use the category
  let searchTerm = getImageCategory(src);
  
  // If the URL contains words that might make good search terms, use them
  const urlParts = src.split('/').pop().split('.')[0].split('-');
  if (urlParts.length > 1) {
    // Use the last two parts of the URL as search terms if they're long enough
    const potentialTerms = urlParts
      .filter(part => part.length > 3)
      .slice(-2);
    
    if (potentialTerms.length > 0) {
      searchTerm = potentialTerms.join(',');
    }
  }
  
  // Generate a deterministic seed from the source URL
  let seed = 0;
  for (let i = 0; i < src.length; i++) {
    seed = ((seed << 5) - seed) + src.charCodeAt(i);
    seed = seed & seed; // Convert to 32bit integer
  }
  seed = Math.abs(seed) % 1000; // Limit to 1000 different images
  
  // Return a reliable Unsplash URL with the search term and seed
  return `https://source.unsplash.com/featured/?${encodeURIComponent(searchTerm)}&sig=${seed}`;
}

/**
 * Custom image loader function
 * @param {Object} params - The parameters for the image loader
 * @param {string} params.src - The source URL of the image
 * @param {number} params.width - The desired width of the image
 * @param {number} params.quality - The desired quality of the image
 * @returns {string} - The URL to use for the image
 */
module.exports = function customImageLoader({ src, width, quality = 75 }) {
  // If it's already an Unsplash URL, just return it
  if (src.includes('unsplash.com')) {
    return src;
  }
  
  // If it's a local file (starts with /), use Next.js default loader
  if (src.startsWith('/')) {
    return `${src}?w=${width}&q=${quality}`;
  }
  
  // For external URLs, use Unsplash as a reliable source
  return generateUnsplashUrl(src, width);
};
