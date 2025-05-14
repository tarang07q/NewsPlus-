"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Clock, Trash2 } from "lucide-react"

import { PageTitle } from "@/components/page-title"
import { NewsCard } from "@/components/news-card"
import { Button } from "@/components/ui/button"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

interface Article {
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
  readAt: string
}

export default function ReadingHistoryPage() {
  const { data: session, status } = useSession()
  const [readingHistory, setReadingHistory] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/login")
    }
  }, [status])

  // Load reading history from local storage
  useEffect(() => {
    if (session?.user?.email) {
      const storageKey = `newsplus-history-${session.user.email}`
      const storedHistory = localStorage.getItem(storageKey)
      
      if (storedHistory) {
        try {
          const parsedHistory = JSON.parse(storedHistory)
          setReadingHistory(parsedHistory)
        } catch (error) {
          console.error("Failed to parse reading history:", error)
        }
      }
      
      setIsLoading(false)
    }
  }, [session])

  const clearHistory = () => {
    if (session?.user?.email) {
      const storageKey = `newsplus-history-${session.user.email}`
      localStorage.removeItem(storageKey)
      setReadingHistory([])
      
      toast({
        title: "Reading history cleared",
        description: "Your reading history has been cleared successfully.",
      })
    }
  }

  const removeFromHistory = (url: string) => {
    if (session?.user?.email) {
      const updatedHistory = readingHistory.filter(article => article.url !== url)
      setReadingHistory(updatedHistory)
      
      const storageKey = `newsplus-history-${session.user.email}`
      localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
      
      toast({
        title: "Article removed",
        description: "The article has been removed from your reading history.",
      })
    }
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <PageTitle>Reading History</PageTitle>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <PageTitle>Reading History</PageTitle>
        
        {readingHistory.length > 0 && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear History
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear reading history?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your entire reading history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearHistory}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      {readingHistory.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-medium mb-2">No reading history yet</h2>
          <p className="text-muted-foreground">Articles you read will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {readingHistory.map((article, index) => (
            <div key={`${article.url}-${index}`} className="relative group">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background/90"
                onClick={() => removeFromHistory(article.url)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove from history</span>
              </Button>
              <NewsCard article={article} />
              <div className="mt-1 text-xs text-muted-foreground flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Read on {new Date(article.readAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
