import { connectToDatabase } from "@/lib/mongodb"

export async function getUserBookmarks(userId: string) {
  const { db } = await connectToDatabase()

  const bookmarks = await db.collection("bookmarks").find({ userId: userId }).toArray()

  return bookmarks
}

export async function addBookmark(userId: string, article: any) {
  const { db } = await connectToDatabase()

  const existingBookmark = await db.collection("bookmarks").findOne({ userId, "article.url": article.url })

  if (existingBookmark) {
    return existingBookmark
  }

  const result = await db.collection("bookmarks").insertOne({
    userId,
    article,
    createdAt: new Date(),
  })

  return result
}

export async function removeBookmark(userId: string, articleUrl: string) {
  const { db } = await connectToDatabase()

  const result = await db.collection("bookmarks").deleteOne({ userId, "article.url": articleUrl })

  return result
}

