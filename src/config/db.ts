import { MongoClient, Db, Collection, Document } from "mongodb";

let _client: MongoClient | null = null;
let _db: Db | null = null;

export async function connectDB(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL environment variable is not set");
  _client = new MongoClient(url);
  await _client.connect();
  _db = _client.db("shopnexus");
  console.log("MongoDB connected successfully");
}

export function getDB(): Db {
  if (!_db) throw new Error("Database not initialized. Call connectDB() first.");
  return _db;
}

export function getCollection<T extends Document>(name: string): Collection<T> {
  return getDB().collection<T>(name);
}
