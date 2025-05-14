"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"

interface SearchBarProps {
  initialQuery?: string
}

export function SearchBar({ initialQuery = "" }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(searchParams.toString())

    // Preserve the current category when searching
    const category = searchParams.get("category") || "general"
    params.set("category", category)

    // Always reset to page 1 when performing a new search
    params.delete("page")

    // Set or remove the search query
    if (query.trim()) {
      params.set("q", query.trim())
    } else {
      params.delete("q")
    }

    // Navigate to the new URL with all parameters properly set
    router.push(`/?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full max-w-lg mx-auto">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for news..."
          className="pl-8"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <Button type="submit" className="ml-2">
        Search
      </Button>
    </form>
  )
}

