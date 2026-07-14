import { ObjectId } from "mongodb";
import { getCollection } from "../config/db";

export interface IReview {
  _id?: ObjectId;
  productId: string;
  userId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export function getReviewCollection() {
  return getCollection<IReview>("reviews");
}
