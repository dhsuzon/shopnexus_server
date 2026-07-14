import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getOrderCollection } from "../models/Order.model";
import { getProductCollection } from "../models/Product.model";
import type { IOrder, IOrderItem, OrderStatus } from "../models/Order.model";

const VALID_STATUSES: OrderStatus[] = ["pending", "shipping", "delivered"];
const toId = (id: string | string[] | undefined): ObjectId => new ObjectId(id as string);

export const createOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items, paymentIntentId } = req.body;
    const userId = req.user?.sub;

    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (req.user?.role === "admin") {
      res.status(403).json({ error: "Admins cannot place orders" });
      return;
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: "Items are required" });
      return;
    }

    const productCol = getProductCollection();
    let totalAmount = 0;
    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      let product;
      try {
        product = await productCol.findOne({ _id: toId(item.productId) });
      } catch {
        res.status(400).json({ error: `Invalid product ID: ${item.productId}` });
        return;
      }
      if (!product) {
        res.status(404).json({ error: `Product ${item.productId} not found` });
        return;
      }
      const quantity = Math.max(1, Number(item.quantity) || 1);
      totalAmount += product.price * quantity;
      orderItems.push({
        productId: product._id!.toHexString(),
        name: product.name,
        price: product.price,
        quantity,
        image: product.images[0] || "",
      });
    }

    const now = new Date();
    const orderCol = getOrderCollection();
    const doc: IOrder = {
      userId,
      items: orderItems,
      totalAmount,
      status: "pending",
      paymentIntentId,
      createdAt: now,
      updatedAt: now,
    };

    const result = await orderCol.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create order" });
  }
};

export const getUserOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const orderCol = getOrderCollection();
    const orders = await orderCol
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const getAllOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orderCol = getOrderCollection();
    const orders = await orderCol
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }
    const orderCol = getOrderCollection();
    const result = await orderCol.findOneAndUpdate(
      { _id: toId(req.params.id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order" });
  }
};
