import { Router } from "express";
import {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "../controllers/order.controller";
import { authenticate } from "../authmiddleware/auth.middleware";
import { requireAdmin } from "../authmiddleware/admin.middleware";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/my-orders", authenticate, getUserOrders);
router.get("/all", authenticate, requireAdmin, getAllOrders);
router.patch("/:id/status", authenticate, requireAdmin, updateOrderStatus);

export default router;
