"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { BarChart as BarChartIcon, PieChart as PieChartIcon, TrendingUp } from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts"

import { PageTitle } from "@/components/page-title"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

interface ReadingStats {
  totalArticles: number
  categoryCounts: Record<string, number>
  sourceCounts: Record<string, number>
  readingByDay: Record<string, number>
}

export default function NewsStatsPage() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<ReadingStats>({
    totalArticles: 0,
    categoryCounts: {},
    sourceCounts: {},
    readingByDay: {}
  })
  const [isLoading, setIsLoading] = useState(true)

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Calculate stats from reading history
  useEffect(() => {
    if (session?.user?.email) {
      const storageKey = `newsplus-history-${session.user.email}`
      const storedHistory = localStorage.getItem(storageKey)
      
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory)
          
          // Calculate stats
          const categoryCounts: Record<string, number> = {}
          const sourceCounts: Record<string, number> = {}
          const readingByDay: Record<string, number> = {}
          
          parsedHistory.forEach((article: any) => {
            // Count by source
            const sourceName = article.source?.name || "Unknown"
            sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1
            
            // Count by category (using tags or a default)
            const category = article.category || "General"
            categoryCounts[category] = (categoryCounts[category] || 0) + 1
            
            // Count by day
            const readDate = new Date(article.readAt || article.publishedAt).toLocaleDateString()
            readingByDay[readDate] = (readingByDay[readDate] || 0) + 1
          })
          
          setStats({
            totalArticles: parsedHistory.length,
            categoryCounts,
            sourceCounts,
            readingByDay
          })
        } catch (error) {
          console.error("Failed to parse reading history:", error)
        }
      }
      
      setIsLoading(false)
    }
  }, [session])

  // Format data for charts
  const categoryData = Object.entries(stats.categoryCounts).map(([name, value]) => ({ name, value }))
  const sourceData = Object.entries(stats.sourceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }))
  
  const readingByDayData = Object.entries(stats.readingByDay)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, count]) => ({ date, count }))

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <PageTitle>News Statistics</PageTitle>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>News Statistics</PageTitle>
      
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Articles Read</CardTitle>
            <BarChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArticles}</div>
            <p className="text-xs text-muted-foreground">Articles in your reading history</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <PieChartIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categoryData.length > 0 
                ? categoryData.sort((a, b) => b.value - a.value)[0]?.name 
                : "None"}
            </div>
            <p className="text-xs text-muted-foreground">Your most read news category</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reading Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {readingByDayData.length > 1 
                ? `${readingByDayData[readingByDayData.length - 1]?.count || 0} articles` 
                : "No data"}
            </div>
            <p className="text-xs text-muted-foreground">Articles read on your last active day</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Top Sources</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="timeline">Reading Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top News Sources</CardTitle>
              <CardDescription>
                The news sources you read from most frequently
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {sourceData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" name="Articles Read" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>News Categories</CardTitle>
              <CardDescription>
                Distribution of news categories you've read
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reading Timeline</CardTitle>
              <CardDescription>
                Your reading activity over time
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {readingByDayData.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No data available yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={readingByDayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#82ca9d" name="Articles Read" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
