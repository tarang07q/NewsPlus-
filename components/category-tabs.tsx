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

  return (
    <div className="border-b overflow-x-auto">
      <div className="flex">
        {categories.map((category) => {
          // Preserve search query when changing category
          const href = currentQuery ? `/?category=${category.slug}&q=${currentQuery}` : `/?category=${category.slug}`

          return (
            <Link
              key={category.slug}
              href={href}
              className={cn(
                "px-4 py-2 text-sm font-medium whitespace-nowrap",
                activeCategory === category.slug
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
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

