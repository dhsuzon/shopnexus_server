import { Router } from "express";
import {
  getDashboardStats,
  getMonthlyOrders,
  getOrderStatusDistribution,
} from "../controllers/dashboard.controller";
import { authenticate } from "../authmiddleware/auth.middleware";
import { requireAdmin } from "../authmiddleware/admin.middleware";

const router = Router();

router.get("/stats", authenticate, requireAdmin, getDashboardStats);
router.get("/monthly-orders", authenticate, requireAdmin, getMonthlyOrders);
router.get("/order-status", authenticate, requireAdmin, getOrderStatusDistribution);

export default router;
