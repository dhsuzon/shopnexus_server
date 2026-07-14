import { Router } from "express";
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  getRelatedProducts,
} from "../controllers/product.controller";
import { authenticate } from "../authmiddleware/auth.middleware";
import { requireAdmin } from "../authmiddleware/admin.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);
router.get("/:id/related", getRelatedProducts);
router.post("/", authenticate, requireAdmin, createProduct);
router.put("/:id", authenticate, requireAdmin, updateProduct);
router.delete("/:id", authenticate, requireAdmin, deleteProduct);

export default router;
