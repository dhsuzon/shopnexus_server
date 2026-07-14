import { ObjectId } from "mongodb";
import { getCollection } from "../config/db";

export type OrderStatus = "pending" | "shipping" | "delivered";

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface IOrder {
  _id?: ObjectId;
  userId: string;
  items: IOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function getOrderCollection() {
  return getCollection<IOrder>("orders");
}
