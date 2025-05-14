export interface NewsArticle {
  source: {
    id: string | null
    name: string
  }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
  category?: string
}

interface NewsParams {
  category?: string
  q?: string
  page?: number
  pageSize?: number
  sources?: string
  domains?: string
  from?: string
  to?: string
  language?: string
  sortBy?: 'relevancy' | 'popularity' | 'publishedAt'
  seed?: string // Random seed for refresh functionality
}

interface NewsResponse {
  status: string
  totalResults: number
  articles: NewsArticle[]
  message?: string // Optional message for errors or info
}

/**
 * Shuffle an array using a seed for deterministic randomness
 * This ensures that the same seed always produces the same shuffle
 */
function shuffleArray<T>(array: T[], seed: number): T[] {
  // Create a copy of the array to avoid mutating the original
  const result = [...array];

  // Use the seed to create a deterministic shuffle
  let currentIndex = result.length;
  let temporaryValue, randomIndex;

  // Seed the random number generator
  let random = function() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  // While there remain elements to shuffle
  while (0 !== currentIndex) {
    // Pick a remaining element
    randomIndex = Math.floor(random() * currentIndex);
    currentIndex -= 1;

    // Swap it with the current element
    temporaryValue = result[currentIndex];
    result[currentIndex] = result[randomIndex];
    result[randomIndex] = temporaryValue;
  }

  return result;
}

// Helper function to check API key and build base URL
function getApiConfig() {
  // Hardcoded API key to avoid any environment variable issues
  const API_KEY = 'a9f7a5af0e7b4e37843a9c9a70d2b5e3'

  return {
    apiKey: API_KEY,
    baseUrl: "https://newsapi.org/v2"
  }
}

// Main function to fetch news by category or search query
export async function fetchNews({
  category = "general",
  q = "",
  page = 1,
  pageSize = 12,
  sortBy = "publishedAt",
  seed
}: NewsParams): Promise<NewsResponse> {
  const { apiKey, baseUrl } = getApiConfig()

  try {
    // Ensure page is a valid number
    const validPage = Math.max(1, page)

    // If we have a seed, use it to modify the query slightly to get different results
    let modifiedQuery = q
    let modifiedCategory = category

    if (seed) {
      // Add a random parameter to the query to get different results
      if (q) {
        // For search queries, add a random word from a list based on the seed
        const randomWords = ["latest", "trending", "recent", "popular", "important", "breaking"]
        const seedIndex = parseInt(seed) % randomWords.length
        modifiedQuery = `${q} ${randomWords[seedIndex]}`
      } else {
        // For category browsing, use the seed to modify the request
        // Add a timestamp based on the seed to get different results
        const sortOptions = ["relevancy", "popularity", "publishedAt"]
        const seedNum = parseInt(seed)

        // Use the seed to select a different sort order
        sortBy = sortOptions[seedNum % sortOptions.length]

        // Also add a small offset to the page size to get different results
        pageSize = pageSize + (seedNum % 3) // Add 0, 1, or 2 to the page size
      }
    }

    // Add a timestamp parameter to prevent caching issues
    const timestamp = new Date().getTime()

    // Add the seed to the timestamp to ensure different results each time
    const seedParam = seed ? `&seed=${seed}` : '';

    let url = `${baseUrl}/top-headlines?category=${modifiedCategory}&page=${validPage}&pageSize=${pageSize}&apiKey=${apiKey}&_t=${timestamp}${seedParam}&sortBy=${sortBy}`

    if (modifiedQuery) {
      url = `${baseUrl}/everything?q=${encodeURIComponent(modifiedQuery)}&page=${validPage}&pageSize=${pageSize}&sortBy=${sortBy}&apiKey=${apiKey}&_t=${timestamp}${seedParam}`
    }

    // Add timeout for better reliability
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: {
        revalidate: q ? 60 : 300 // Cache search results for 1 minute, category results for 5 minutes
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      // Handle specific error codes
      if (response.status === 429) {
        console.warn("News API rate limit exceeded")
      } else {
        console.error(`News API responded with status: ${response.status}`)
      }

      // Return an empty response with error status
      return {
        status: 'error',
        totalResults: 0,
        articles: [],
        message: response.status === 429
          ? 'API rate limit reached. Please try again later.'
          : `API Error: ${response.status}`
      }
    }

    try {
      const data = await response.json()

      // Add category to each article but keep original image URLs
      if (data.articles) {
        data.articles = data.articles.map((article: NewsArticle) => {
          return {
            ...article,
            // Add category if applicable
            ...(category && category !== "general" && !q ? { category } : {}),
            // Keep the original image URL
            urlToImage: article.urlToImage,
            // Ensure we don't have null values that could cause issues
            description: article.description || 'No description available',
            content: article.content || 'No content available',
            author: article.author || 'Unknown'
          };
        });
      }

      return data
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      // Return an empty response with error status
      return {
        status: 'error',
        totalResults: 0,
        articles: [],
        message: 'Error parsing API response'
      }
    }
  } catch (error) {
    console.error("Error fetching news:", error)
    // Return an empty response with error status
    return {
      status: 'error',
      totalResults: 0,
      articles: [],
      message: error instanceof Error ? error.message : 'Unknown error fetching news'
    }
  }
}

// Helper function to generate mock news data when the API fails
function getMockNewsData(category: string, query: string, count: number): NewsResponse {
  const topic = query || category || "general news"
  const mockArticles: NewsArticle[] = []

  // Generate mock articles
  for (let i = 0; i < count; i++) {
    const title = `${topic.charAt(0).toUpperCase() + topic.slice(1)}: Article ${i + 1}`;

    // Use a hardcoded placeholder image based on category
    const categoryMap: Record<string, string> = {
      'business': 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80',
      'entertainment': 'https://images.unsplash.com/photo-1603190287605-e6ade32fa852?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'general': 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
      'health': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'science': 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'sports': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'trending': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      'source': 'https://images.unsplash.com/photo-1495020689067-958852a7765e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80',
    };

    // Get image for category or use default
    const placeholderImage = categoryMap[category] || categoryMap['general'];

    mockArticles.push({
      source: { id: null, name: "NewsPlus" },
      author: "NewsPlus Team",
      title: title,
      description: `This is a placeholder article about ${topic} created when the API request failed.`,
      url: "#",
      urlToImage: placeholderImage,
      publishedAt: new Date().toISOString(),
      content: `This is placeholder content for an article about ${topic}.`,
      category: category !== "general" ? category : undefined
    })
  }

  return {
    status: "ok",
    totalResults: count,
    articles: mockArticles
  }
}

// Fetch trending news (most popular articles)
export async function fetchTrendingNews(count: number = 5): Promise<NewsResponse> {
  const { apiKey, baseUrl } = getApiConfig()

  try {
    // For trending news, we use the 'everything' endpoint with a broad query
    // and sort by popularity
    const url = `${baseUrl}/everything?q=trending OR popular OR important&sortBy=popularity&pageSize=${count}&apiKey=${apiKey}`

    // Add timeout for better reliability
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: {
        revalidate: 3600 // Cache trending news for 1 hour
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`News API responded with status: ${response.status}`)
      // Return an empty response with error status
      return {
        status: 'error',
        totalResults: 0,
        articles: [],
        message: response.status === 429
          ? 'API rate limit reached. Please try again later.'
          : `API Error: ${response.status}`
      }
    }

    try {
      const data = await response.json()

      // Add trending category to articles but keep original image URLs
      if (data.articles) {
        data.articles = data.articles.map((article: NewsArticle) => {
          return {
            ...article,
            category: "trending",
            // Keep the original image URL
            urlToImage: article.urlToImage,
            description: article.description || 'No description available',
            content: article.content || 'No content available',
            author: article.author || 'Unknown'
          };
        });
      }

      return data
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      // Return an empty response with error status
      return {
        status: 'error',
        totalResults: 0,
        articles: [],
        message: 'Error parsing API response'
      }
    }
  } catch (error) {
    console.error("Error fetching trending news:", error)
    // Return an empty response with error status
    return {
      status: 'error',
      totalResults: 0,
      articles: [],
      message: error instanceof Error ? error.message : 'Unknown error fetching news'
    }
  }
}

// Fetch news from specific sources
export async function fetchNewsBySource(sources: string, count: number = 5): Promise<NewsResponse> {
  const { apiKey, baseUrl } = getApiConfig()

  // Add a timestamp parameter to prevent caching issues
  const timestamp = new Date().getTime()
  const url = `${baseUrl}/top-headlines?sources=${sources}&pageSize=${count}&apiKey=${apiKey}&_t=${timestamp}`

  try {
    // Add timeout for better reliability
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    const response = await fetch(url, {
      next: {
        revalidate: 1800 // Cache for 30 minutes
      },
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error(`News API responded with status: ${response.status}`)
      // Return an empty response with error status
      return {
        status: 'error',
        totalResults: 0,
        articles: [],
        message: response.status === 429
          ? 'API rate limit reached. Please try again later.'
          : `API Error: ${response.status}`
      }
    }

    try {
      const data = await response.json()

      // Handle missing fields but keep original image URLs
      if (data.articles) {
        data.articles = data.articles.map((article: NewsArticle) => {
          return {
            ...article,
            // Keep the original image URL
            urlToImage: article.urlToImage,
            description: article.description || 'No description available',
            content: article.content || 'No content available',
            author: article.author || 'Unknown'
          };
        });
      }

      return data
    } catch (parseError) {
      console.error("Error parsing API response:", parseError)
      // Return an empty response with error status
      return {
        status: 'error',
        totalResults: 0,
        articles: [],
        message: 'Error parsing API response'
      }
    }
  } catch (error) {
    console.error("Error fetching news by source:", error)
    // Return an empty response with error status
    return {
      status: 'error',
      totalResults: 0,
      articles: [],
      message: error instanceof Error ? error.message : 'Unknown error fetching news'
    }
  }
}

// Fetch news for multiple categories at once (for dashboard)
export async function fetchMultiCategoryNews(
  categories: string[] = ["technology", "business", "science"],
  articlesPerCategory: number = 4
): Promise<Record<string, NewsArticle[]>> {
  const results: Record<string, NewsArticle[]> = {}

  try {
    // Create an array of promises with a timeout for each
    const promises = categories.map(async (category) => {
      try {
        // Use fetchNews with timeout already built in
        const response = await fetchNews({
          category,
          pageSize: articlesPerCategory
        })

        return {
          category,
          articles: response.articles
        }
      } catch (err) {
        console.error(`Error fetching ${category} news:`, err)
        // Return mock data for this category
        return {
          category,
          articles: getMockNewsData(category, "", articlesPerCategory).articles
        }
      }
    })

    // Wait for all promises to resolve
    const responses = await Promise.all(promises)

    // Organize results by category but keep original image URLs
    responses.forEach(({ category, articles }) => {
      results[category] = articles.map(article => {
        return {
          ...article,
          category,
          // Keep the original image URL
          urlToImage: article.urlToImage,
          description: article.description || 'No description available',
          content: article.content || 'No content available',
          author: article.author || 'Unknown'
        };
      });
    })

    return results
  } catch (error) {
    console.error("Error fetching multi-category news:", error)

    // Return empty results for all categories
    return categories.reduce((acc, category) => {
      acc[category] = [];
      return acc;
    }, {} as Record<string, NewsArticle[]>)
  }
}

