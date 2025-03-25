"use client"

import { useState } from "react"
import Image from "next/image"
import { formatDistanceToNow } from "date-fns"
import { Bookmark, Heart, ExternalLink } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"

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

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative aspect-video">
        <Image
          src={article.urlToImage || "/placeholder.svg?height=200&width=400"}
          alt={article.title}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="flex-1 p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{article.source.name}</span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
          </span>
        </div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{article.title}</h3>
        <p className="text-muted-foreground text-sm line-clamp-3">{article.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLike}
            disabled={isLoading}
            className={cn(isLiked && "text-red-500")}
          >
            <Heart className="h-5 w-5" />
            <span className="sr-only">Like</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBookmark}
            disabled={isLoading}
            className={cn(isBookmarked && "text-primary")}
          >
            <Bookmark className="h-5 w-5" />
            <span className="sr-only">Bookmark</span>
          </Button>
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={article.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Read More
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

