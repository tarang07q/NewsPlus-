import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { fetchNews } from "@/lib/news"
import { NewsCard } from "@/components/news-card"
import { CategoryTabs } from "@/components/category-tabs"
import { SearchBar } from "@/components/search-bar"
import { PageTitle } from "@/components/page-title"

export default async function Home({
  searchParams,
}: {
  searchParams: { category?: string; q?: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const category = searchParams.category || "general"
  const searchQuery = searchParams.q || ""

  const news = await fetchNews({ category, q: searchQuery })

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>NewsPlus+ Dashboard</PageTitle>
      <div className="mb-8">
        <SearchBar initialQuery={searchQuery} />
      </div>
      <CategoryTabs activeCategory={category} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {news.articles.map((article, index) => (
          <NewsCard key={index} article={article} />
        ))}
      </div>
    </div>
  )
}

