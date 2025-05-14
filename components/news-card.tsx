"use client"

import { useState, useEffect } from "react"
import { formatDistanceToNow } from "date-fns"
import { Bookmark, Heart, ExternalLink, Share2, Newspaper } from "lucide-react"
import ApiImage from "./api-image"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { getCategoryGradient, getCategoryIconColor, getCategoryBgColor, getFallbackImageUrl } from "@/lib/image-utils"

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
  category?: string
  readAt?: string
}

interface NewsCardProps {
  article: Article
  bookmarked?: boolean
  liked?: boolean
}

export function NewsCard({ article, bookmarked = false, liked = false }: NewsCardProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isBookmarked, setIsBookmarked] = useState(bookmarked)
  const [isLiked, setIsLiked] = useState(liked)
  const [isLoading, setIsLoading] = useState(false)

  // Track article in reading history when it's viewed
  useEffect(() => {
    if (session?.user?.email) {
      const storageKey = `newsplus-history-${session.user.email}`

      // Get existing history
      const existingHistory = localStorage.getItem(storageKey)
      let history = existingHistory ? JSON.parse(existingHistory) : []

      // Check if this article is already in history
      const existingIndex = history.findIndex((item: Article) => item.url === article.url)

      if (existingIndex >= 0) {
        // Update the readAt timestamp if it already exists
        history[existingIndex].readAt = new Date().toISOString()
      } else {
        // Add to history with current timestamp
        const articleWithTimestamp = {
          ...article,
          readAt: new Date().toISOString()
        }

        // Add to the beginning of the array (most recent first)
        history.unshift(articleWithTimestamp)

        // Limit history to 100 items
        if (history.length > 100) {
          history = history.slice(0, 100)
        }
      }

      // Save back to localStorage
      localStorage.setItem(storageKey, JSON.stringify(history))
    }
  }, [article, session])

  const handleBookmark = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to bookmark articles",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/bookmarks", {
        method: isBookmarked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ article }),
      })

      if (!response.ok) {
        throw new Error("Failed to update bookmark")
      }

      setIsBookmarked(!isBookmarked)
      toast({
        title: isBookmarked ? "Bookmark removed" : "Article bookmarked",
        description: isBookmarked
          ? "The article has been removed from your bookmarks"
          : "The article has been added to your bookmarks",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update bookmark. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLike = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please login to like articles",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/likes", {
        method: isLiked ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ article }),
      })

      if (!response.ok) {
        throw new Error("Failed to update like")
      }

      setIsLiked(!isLiked)
      toast({
        title: isLiked ? "Like removed" : "Article liked",
        description: isLiked ? "You have unliked this article" : "You have liked this article",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url,
        })

        toast({
          title: "Shared successfully",
          description: "The article has been shared",
        })
      } catch (error) {
        // User cancelled or share failed
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(article.url)

      toast({
        title: "Link copied",
        description: "Article link copied to clipboard",
      })
    }
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-xl dark:hover:shadow-primary/5 hover:-translate-y-1 border-2">
      <div className="relative aspect-video overflow-hidden">
        {/* Use ApiImage to handle images from the API with fallbacks */}
        <ApiImage
          src={article.urlToImage}
          category={article.category}
          alt={article.title}
          className="transition-all duration-500 group-hover:scale-105"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20" />

        {/* Category badge */}
        {article.category && (
          <div className="absolute top-2 right-2 z-30">
            <Badge variant="secondary" className="bg-primary/10 hover:bg-primary/20 transition-colors text-xs font-medium">
              {article.category}
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex-1 p-5 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium bg-secondary/50 px-2 py-1 rounded-full">
            {article.source.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
          </span>
        </div>

        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>

        {article.description ? (
          <p className="text-muted-foreground text-sm line-clamp-3">{article.description}</p>
        ) : (
          <p className="text-muted-foreground text-sm italic">No description available</p>
        )}
      </CardContent>

      <CardFooter className="p-5 pt-0 flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            disabled={isLoading}
            className={cn(
              "rounded-full transition-transform hover:scale-110",
              isLiked ? "text-red-500 bg-red-50 dark:bg-red-900/20" : ""
            )}
            aria-label="Like article"
          >
            <Heart className={cn("h-5 w-5", isLiked ? "fill-current" : "")} />
            <span className="sr-only">Like</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            disabled={isLoading}
            className={cn(
              "rounded-full transition-transform hover:scale-110",
              isBookmarked ? "text-primary bg-primary/10" : ""
            )}
            aria-label="Bookmark article"
          >
            <Bookmark className={cn("h-5 w-5", isBookmarked ? "fill-current" : "")} />
            <span className="sr-only">Bookmark</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleShare}
            className="rounded-full transition-transform hover:scale-110"
            aria-label="Share article"
          >
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          asChild
          className="relative overflow-hidden group/button"
        >
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all z-10 font-medium"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Read More
            <span className="absolute inset-0 bg-primary scale-x-0 group-hover/button:scale-x-100 transition-transform duration-300 origin-left -z-10" />
            <span className="absolute inset-0 bg-primary/10 -z-10" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

