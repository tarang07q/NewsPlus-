import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

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

    const { db } = await connectToDatabase()

    const existingLike = await db.collection("likes").findOne({ userId: session.user.id, "article.url": article.url })

    if (existingLike) {
      return NextResponse.json({ message: "Article already liked", like: existingLike }, { status: 200 })
    }

    const result = await db.collection("likes").insertOne({
      userId: session.user.id,
      article,
      createdAt: new Date(),
    })

    return NextResponse.json({ message: "Article liked successfully", like: result }, { status: 201 })
  } catch (error) {
    console.error("Error liking article:", error)
    return NextResponse.json({ message: "Failed to like article" }, { status: 500 })
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

    const { db } = await connectToDatabase()

    await db.collection("likes").deleteOne({
      userId: session.user.id,
      "article.url": article.url,
    })

    return NextResponse.json({ message: "Like removed successfully" }, { status: 200 })
  } catch (error) {
    console.error("Error removing like:", error)
    return NextResponse.json({ message: "Failed to remove like" }, { status: 500 })
  }
}

