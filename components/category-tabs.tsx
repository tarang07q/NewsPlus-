"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

const categories = [
  { name: "General", slug: "general" },
  { name: "Business", slug: "business" },
  { name: "Entertainment", slug: "entertainment" },
  { name: "Health", slug: "health" },
  { name: "Science", slug: "science" },
  { name: "Sports", slug: "sports" },
  { name: "Technology", slug: "technology" },
]

interface CategoryTabsProps {
  activeCategory: string
}

export function CategoryTabs({ activeCategory }: CategoryTabsProps) {
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get("q") || ""

  // Create a function to generate the URL for each category tab
  const getCategoryUrl = (categorySlug: string) => {
    // Create a new URLSearchParams object from the current search params
    const params = new URLSearchParams(searchParams.toString())

    // Update the category parameter
    params.set("category", categorySlug)

    // Reset to page 1 when changing categories
    params.delete("page")

    // Return the new URL with all other parameters preserved
    return `/?${params.toString()}`
  }

  return (
    <div className="border-b overflow-x-auto">
      <div className="flex">
        {categories.map((category) => {
          return (
            <Link
              key={category.slug}
              href={getCategoryUrl(category.slug)}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200",
                activeCategory === category.slug
                  ? "border-b-2 border-primary text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
              )}
            >
              {category.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

