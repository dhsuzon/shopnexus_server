import { Request, Response } from "express";
import { getOrderCollection } from "../models/Order.model";
import { getProductCollection } from "../models/Product.model";
import { getCollection } from "../config/db";

export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orderCol = getOrderCollection();
    const productCol = getProductCollection();
    const userCol = getCollection<Record<string, unknown>>("users");

    const [totalOrders, totalProducts, totalUsers, orders] = await Promise.all([
      orderCol.countDocuments(),
      productCol.countDocuments(),
      userCol.countDocuments(),
      orderCol.find().toArray(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    res.json({
      totalOrders,
      totalProducts,
      totalRevenue,
      totalUsers,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
};

export const getMonthlyOrders = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orderCol = getOrderCollection();
    const orders = await orderCol.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              {
                $arrayElemAt: [
                  ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                  "$_id.month",
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          count: 1,
          revenue: 1,
        },
      },
    ]).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch monthly orders" });
  }
};

export const getOrderStatusDistribution = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orderCol = getOrderCollection();
    const distribution = await orderCol.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          value: "$count",
        },
      },
    ]).toArray();
    res.json(distribution);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order status distribution" });
  }
};
