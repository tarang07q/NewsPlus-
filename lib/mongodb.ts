import { MongoClient } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/newsplus"
const MONGODB_DB = process.env.MONGODB_DB || "newsplus"

let cachedClient: MongoClient | null = null
let cachedDb: any = null

export async function connectToDatabase() {
  try {
    // Return cached connection if available
    if (cachedClient && cachedDb) {
      return { client: cachedClient, db: cachedDb }
    }

    if (!MONGODB_URI) {
      console.error("MONGODB_URI environment variable is not defined")
      return { client: null, db: null }
    }

    if (!MONGODB_DB) {
      console.error("MONGODB_DB environment variable is not defined")
      return { client: null, db: null }
    }

    // Set a connection timeout
    const client = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000, // 10 seconds
      socketTimeoutMS: 45000, // 45 seconds
    })

    // Connect with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      )
    ])

    const db = client.db(MONGODB_DB)

    // Cache the connection
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    // Return null values to indicate connection failure
    return { client: null, db: null }
  }
}

