interface NewsParams {
  category?: string
  q?: string
  page?: number
  pageSize?: number
}

export async function fetchNews({ category = "general", q = "", page = 1, pageSize = 12 }: NewsParams) {
  const API_KEY = process.env.NEWS_API_KEY

  if (!API_KEY) {
    throw new Error("NEWS_API_KEY is not defined")
  }

  let url = `https://newsapi.org/v2/top-headlines?category=${category}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`

  if (q) {
    url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}&apiKey=${API_KEY}`
  }

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour

    if (!response.ok) {
      throw new Error(`News API responded with status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching news:", error)
    return { articles: [] }
  }
}

