import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getReviewCollection } from "../models/Review.model";
import { getProductCollection } from "../models/Product.model";
import type { IReview } from "../models/Review.model";
import type { AuthPayload } from "../authmiddleware/auth.middleware";

const toId = (id: string | string[] | undefined): ObjectId => new ObjectId(id as string);

export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const col = getReviewCollection();
    const reviews = await col
      .find({ productId: id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(reviews);
  } catch {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

export const createReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { rating, comment } = req.body;
    const user = req.user as AuthPayload;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ error: "Rating must be between 1 and 5" });
      return;
    }
    if (!comment || comment.trim().length === 0) {
      res.status(400).json({ error: "Comment is required" });
      return;
    }

    const productCol = getProductCollection();
    const product = await productCol.findOne({ _id: toId(id) });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const reviewCol = getReviewCollection();
    const now = new Date();
    const doc: IReview = {
      productId: id,
      userId: user.sub,
      userName: user.name,
      userImage: user.image || undefined,
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: now,
    };

    await reviewCol.insertOne(doc);

    const stats = await reviewCol
      .aggregate([
        { $match: { productId: id } },
        { $group: { _id: null, avgRating: { $avg: "$rating" } } },
      ])
      .toArray();

    const newRating = stats.length > 0 ? Math.round(stats[0].avgRating * 10) / 10 : Number(rating);
    await productCol.updateOne(
      { _id: toId(id) },
      { $set: { rating: newRating, updatedAt: now } }
    );

    res.status(201).json(doc);
  } catch {
    res.status(400).json({ error: "Failed to create review" });
  }
};
