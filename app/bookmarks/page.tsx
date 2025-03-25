import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"

import { authOptions } from "@/lib/auth"
import { getUserBookmarks } from "@/lib/bookmarks"
import { NewsCard } from "@/components/news-card"
import { PageTitle } from "@/components/page-title"

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const bookmarks = await getUserBookmarks(session.user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <PageTitle>Your Bookmarks</PageTitle>
      {bookmarks.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-2">No bookmarks yet</h2>
          <p className="text-muted-foreground">When you bookmark articles, they will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {bookmarks.map((bookmark, index) => (
            <NewsCard key={index} article={bookmark.article} bookmarked={true} />
          ))}
        </div>
      )}
    </div>
  )
}

