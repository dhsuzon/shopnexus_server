import { Router } from "express";
import { getProductReviews, createReview } from "../controllers/review.controller";
import { authenticate } from "../authmiddleware/auth.middleware";

const router = Router();

router.get("/:id/reviews", getProductReviews);
router.post("/:id/reviews", authenticate, createReview);

export default router;
