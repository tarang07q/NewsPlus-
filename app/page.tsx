import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { fetchNews } from "@/lib/news"
import { NewsCard } from "@/components/news-card"
import { CategoryTabs } from "@/components/category-tabs"
import { SearchBar } from "@/components/search-bar"
import { PageTitle } from "@/components/page-title"
import { LoadMore } from "@/components/load-more"

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // In Next.js 13+, we need to handle searchParams safely
  // Extract values directly from searchParams to avoid the warning
  const category = typeof searchParams.category === 'string' ? searchParams.category : "general"
  const searchQuery = typeof searchParams.q === 'string' ? searchParams.q : ""
  const pageParam = typeof searchParams.page === 'string' ? searchParams.page : "1"
  const page = parseInt(pageParam, 10)

  // Get random seed if provided (for refresh functionality)
  const seed = typeof searchParams.seed === 'string' ? searchParams.seed : undefined

  // Set a consistent page size
  const pageSize = 12

  // Fetch news based on category and search query
  const news = await fetchNews({
    category,
    q: searchQuery,
    page,
    pageSize,
    seed // Pass the seed if available
  })

  // Check if there are more articles to load
  // NewsAPI provides totalResults in the response
  const hasMore = news.articles.length > 0 &&
                 news.articles.length === pageSize &&
                 page * pageSize < (news.totalResults || 0)

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>NewsPlus+ Dashboard</PageTitle>
      <div className="mb-8">
        <SearchBar initialQuery={searchQuery} />
      </div>
      <CategoryTabs activeCategory={category} />

      {news.status === 'error' ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">Error loading articles</h2>
          <p className="text-muted-foreground">{news.message || 'Please try again later.'}</p>
        </div>
      ) : news.articles.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No articles found</h2>
          <p className="text-muted-foreground">Try a different search term or category.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8 news-grid">
            {news.articles.map((article, index) => (
              <div key={`${article.url}-${index}`} className="news-card">
                <NewsCard article={article} />
              </div>
            ))}
          </div>

          <LoadMore currentPage={page} hasMore={hasMore} />
        </>
      )}
    </div>
  )
}

