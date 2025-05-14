"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BarChart,
  Newspaper,
  TrendingUp,
  Bookmark,
  History,
  Bell,
  Settings,
  Sparkles,
  Zap,
  ChevronRight,
  Clock,
  Search
} from "lucide-react"

import ApiImage from "@/components/api-image"

import { fetchTrendingNews, fetchMultiCategoryNews, NewsArticle } from "@/lib/news"

import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewsCard } from "@/components/news-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

// Popular topics for news search
const trendingTopics = [
  "Artificial Intelligence",
  "Climate Change",
  "Space Exploration",
  "Renewable Energy",
  "Global Economy",
  "Quantum Computing",
  "Blockchain",
  "Healthcare Innovation"
]

// Categories for personalization
const userCategories = [
  { name: "Technology", slug: "technology", icon: <Zap className="h-4 w-4" /> },
  { name: "Science", slug: "science", icon: <Sparkles className="h-4 w-4" /> },
  { name: "Business", slug: "business", icon: <BarChart className="h-4 w-4" /> },
  { name: "Health", slug: "health", icon: <Sparkles className="h-4 w-4" /> },
  { name: "Entertainment", slug: "entertainment", icon: <Sparkles className="h-4 w-4" /> }
]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  // Extend NewsArticle to include readAt property for reading history
  interface ReadingHistoryArticle extends NewsArticle {
    readAt?: string;
  }

  const [recentArticles, setRecentArticles] = useState<ReadingHistoryArticle[]>([])
  const [recommendedArticles, setRecommendedArticles] = useState<NewsArticle[]>([])
  const [trendingArticles, setTrendingArticles] = useState<NewsArticle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [readingStats, setReadingStats] = useState({
    totalRead: 0,
    categories: {} as Record<string, number>,
    sources: {} as Record<string, number>,
    streak: 0
  })

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Load reading history and stats
  useEffect(() => {
    if (session?.user?.email) {
      setIsLoading(true)

      // Get reading history from localStorage
      const storageKey = `newsplus-history-${session.user.email}`
      const storedHistory = localStorage.getItem(storageKey)

      // Calculate reading stats from history
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory) as ReadingHistoryArticle[]

          // Get recent articles (last 3)
          setRecentArticles(parsedHistory.slice(0, 3))

          // Calculate reading stats
          const categories: Record<string, number> = {}
          const sources: Record<string, number> = {}
          const readDates = new Set<string>()

          parsedHistory.forEach((article: ReadingHistoryArticle) => {
            // Count by category
            const category = article.category || "general"
            categories[category] = (categories[category] || 0) + 1

            // Count by source
            const source = article.source?.name || "Unknown"
            sources[source] = (sources[source] || 0) + 1

            // Track reading dates for streak calculation
            if (article.readAt) {
              const readDate = new Date(article.readAt).toLocaleDateString()
              readDates.add(readDate)
            }
          })

          // Calculate reading streak (simplified version)
          const today = new Date().toLocaleDateString()
          const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()
          let streak = 0

          if (readDates.has(today)) {
            streak = 1
            let checkDate = yesterday
            let daysBack = 1

            // Check consecutive days back
            while (readDates.has(checkDate) && daysBack < 30) {
              streak++
              daysBack++
              checkDate = new Date(Date.now() - (86400000 * daysBack)).toLocaleDateString()
            }
          }

          setReadingStats({
            totalRead: parsedHistory.length,
            categories,
            sources,
            streak
          })
        } catch (error) {
          console.error("Failed to parse reading history:", error)
        }
      }

      // Fetch trending news
      const fetchData = async () => {
        try {
          // Fetch trending news with error handling
          let trendingArticles: NewsArticle[] = [];
          try {
            const trendingResponse = await fetchTrendingNews(3)
            if (trendingResponse.status === 'error') {
              console.warn("Error in trending news API:", trendingResponse.message)
              setTrendingArticles([])
            } else {
              trendingArticles = trendingResponse.articles;
              setTrendingArticles(trendingResponse.articles)
            }
          } catch (trendingError) {
            console.error("Error fetching trending news:", trendingError)
            setTrendingArticles([])
          }

          // Fetch news from user's preferred categories with error handling
          const preferredCategories = userCategories.map(cat => cat.slug)
          let categoryNews: Record<string, NewsArticle[]> = {};

          try {
            categoryNews = await fetchMultiCategoryNews(preferredCategories, 3)
          } catch (categoryError) {
            console.error("Error fetching category news:", categoryError)
            // Create empty category news as fallback
            const emptyNews: Record<string, NewsArticle[]> = {};
            preferredCategories.forEach(cat => {
              emptyNews[cat] = [];
            });
            categoryNews = emptyNews;
          }

          // Set recommended articles based on user's top category or trending
          const topCategory = Object.entries(readingStats.categories)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || "technology"

          if (categoryNews[topCategory] && categoryNews[topCategory].length > 0) {
            setRecommendedArticles(categoryNews[topCategory])
          } else if (trendingArticles.length > 0) {
            setRecommendedArticles(trendingArticles)
          } else {
            // If all else fails, set empty array
            setRecommendedArticles([])
          }

        } catch (error) {
          console.error("Error fetching news for dashboard:", error)
        } finally {
          // Always set loading to false, even if there are errors
          setIsLoading(false)
        }
      }

      fetchData()
    }
  }, [session])

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PageTitle>Your Dashboard</PageTitle>
        <DashboardSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <PageTitle>Your Dashboard</PageTitle>
          <p className="text-muted-foreground">
            Welcome back, {session?.user?.name || "Reader"}! Here's your personalized news overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/news-preferences">
              <Settings className="mr-2 h-4 w-4" />
              Preferences
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/news-alerts">
              <Bell className="mr-2 h-4 w-4" />
              Alerts
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Articles Read</CardTitle>
            <div className="p-2 rounded-full bg-primary/10">
              <Newspaper className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingStats.totalRead}</div>
            <p className="text-xs text-muted-foreground">Total articles in your reading history</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {Object.keys(readingStats.categories).length > 0
                ? Object.entries(readingStats.categories)
                    .sort((a, b) => b[1] - a[1])[0][0]
                : "None yet"}
            </div>
            <p className="text-xs text-muted-foreground">Your most read news category</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Source</CardTitle>
            <div className="p-2 rounded-full bg-primary/10">
              <Zap className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">
              {Object.keys(readingStats.sources).length > 0
                ? Object.entries(readingStats.sources)
                    .sort((a, b) => b[1] - a[1])[0][0]
                : "None yet"}
            </div>
            <p className="text-xs text-muted-foreground">Your most read news source</p>
          </CardContent>
        </Card>

        <Card className="border-2 hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Streak</CardTitle>
            <div className="p-2 rounded-full bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {readingStats.streak} {readingStats.streak === 1 ? 'day' : 'days'}
            </div>
            <p className="text-xs text-muted-foreground">Your current reading streak</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommended" className="space-y-6">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedArticles.length > 0 ? (
              recommendedArticles.map((article, index) => (
                <NewsCard key={`recommended-${index}`} article={article} />
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground">
                  Read more articles to get personalized recommendations
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/">Browse Articles</Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentArticles.length > 0 ? (
              recentArticles.map((article, index) => (
                <div key={`recent-${index}`} className="relative group">
                  <div className="absolute top-2 right-2 z-10 bg-background/80 px-2 py-1 rounded-md text-xs flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {article.readAt
                        ? new Date(article.readAt).toLocaleDateString()
                        : "Recently"}
                    </span>
                  </div>
                  <NewsCard article={article} />
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No reading history yet</h3>
                <p className="text-muted-foreground">
                  Articles you read will appear here
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/">Start Reading</Link>
                </Button>
              </div>
            )}
          </div>

          {recentArticles.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" asChild>
                <Link href="/reading-history">
                  View Full History
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card className="mb-6 border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Trending Topics</CardTitle>
                  <CardDescription>
                    Popular topics in the news right now
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {trendingTopics.map((topic, index) => (
                      <Link href={`/?q=${encodeURIComponent(topic)}`} key={index}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 transition-colors">
                          {topic}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/">
                      <Search className="mr-2 h-4 w-4" />
                      Explore All Topics
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border-2 hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle>Your Interests</CardTitle>
                  <CardDescription>
                    Categories you follow based on your reading
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {userCategories.map((category, index) => (
                      <Link
                        href={`/?category=${category.slug}`}
                        key={index}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <div className="flex items-center">
                          <div className="mr-2 bg-primary/10 p-2 rounded-full">
                            {category.icon}
                          </div>
                          <span>{category.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href="/news-preferences">
                      <Settings className="mr-2 h-4 w-4" />
                      Customize Interests
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-primary" />
                Trending Articles
              </h3>
              <div className="space-y-4">
                {trendingArticles.length > 0 ? (
                  trendingArticles.map((article, index) => (
                    <Card key={`trending-${index}`} className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
                      <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-1/3 h-24 md:h-auto">
                          {/* Use ApiImage to handle images from the API with fallbacks */}
                          <ApiImage
                            src={article.urlToImage}
                            category={article.category}
                            alt={article.title}
                          />
                        </div>
                        <div className="p-4 flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="outline" className="text-xs">
                              {article.source.name}
                            </Badge>
                          </div>
                          <h4 className="font-medium line-clamp-2 text-sm mb-1">{article.title}</h4>
                          <Button variant="ghost" size="sm" className="mt-2 p-0 h-auto" asChild>
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary flex items-center"
                            >
                              Read Article
                              <ChevronRight className="ml-1 h-3 w-3" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No trending articles available</p>
                    <p className="text-xs text-muted-foreground mt-2">Try refreshing the page later</p>
                  </div>
                )}

                <Button variant="outline" className="w-full" asChild>
                  <Link href="/">
                    View All Trending News
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-3 w-40" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-[300px]" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(3).fill(0).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[200px] w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
