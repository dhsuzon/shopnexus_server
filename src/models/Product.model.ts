import { ObjectId } from "mongodb";
import { getCollection } from "../config/db";

export interface IProduct {
  _id?: ObjectId;
  name: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  price: number;
  category: string;
  images: string[];
  rating: number;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function getProductCollection() {
  return getCollection<IProduct>("products");
}
