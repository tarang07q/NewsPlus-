import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { addBookmark, removeBookmark } from "@/lib/bookmarks"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { article } = await request.json()

    if (!article) {
      return NextResponse.json({ message: "Article data is required" }, { status: 400 })
    }

    const result = await addBookmark(session.user.id, article)

    return NextResponse.json({ message: "Article bookmarked successfully", bookmark: result }, { status: 201 })
  } catch (error) {
    console.error("Error adding bookmark:", error)
    return NextResponse.json({ message: "Failed to bookmark article" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { article } = await request.json()

    if (!article?.url) {
      return NextResponse.json({ message: "Article URL is required" }, { status: 400 })
    }

    await removeBookmark(session.user.id, article.url)

    return NextResponse.json({ message: "Bookmark removed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error removing bookmark:", error)
    return NextResponse.json({ message: "Failed to remove bookmark" }, { status: 500 })
  }
}

