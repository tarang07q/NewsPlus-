"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Sparkles } from "lucide-react"

interface LoadMoreProps {
  currentPage: number
  hasMore: boolean
}

export function LoadMore({ currentPage, hasMore }: LoadMoreProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Add animation when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Function to refresh with random news
  const handleRefresh = () => {
    setIsLoading(true)

    try {
      // Get current parameters
      const params = new URLSearchParams(searchParams.toString())
      const category = params.get("category") || "general"
      const query = params.get("q") || ""

      // Create a random seed to get different results
      const randomSeed = Math.floor(Math.random() * 10000)

      // Update the seed parameter
      params.set("seed", randomSeed.toString())

      // Reset to page 1
      params.delete("page")

      // Create the URL with all parameters preserved
      const url = `/?${params.toString()}`

      // Navigate to the new URL
      router.push(url)

      // We'll keep the loading state for a bit to show the animation
      setTimeout(() => {
        setIsLoading(false)

        // Scroll to top
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      }, 800)
    } catch (error) {
      console.error("Error refreshing news:", error)
      setIsLoading(false)

      // Show a toast or notification to the user
      alert("Failed to refresh articles. Please try again.")
    }
  }

  return (
    <div className={`flex flex-col items-center mt-12 mb-8 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="mb-4 bg-primary/10 p-4 rounded-full animate-pulse">
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <Button
        onClick={handleRefresh}
        disabled={isLoading}
        className="min-w-[250px] h-14 relative overflow-hidden group transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg border-2 border-primary/30"
        variant="outline"
        size="lg"
      >
        <span className="absolute inset-0 w-full h-full bg-primary/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left -z-10"></span>
        <span className="relative z-10 font-medium">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Refreshing articles...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <RefreshCw className="mr-2 h-5 w-5 animate-spin-slow" />
              <span>Discover More Articles</span>
            </div>
          )}
        </span>
      </Button>
      <p className="mt-4 text-sm text-muted-foreground text-center max-w-md">
        Click to see different articles in this category
      </p>
    </div>
  )
}
