import { Router, Request, Response } from "express";
import { getCollection } from "../config/db";

const router = Router();

router.post("/subscribe", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: "Valid email is required" });
      return;
    }

    const col = getCollection<{ email: string; subscribedAt: Date }>("subscribers");
    const existing = await col.findOne({ email });
    if (existing) {
      res.json({ success: true, message: "Already subscribed" });
      return;
    }

    await col.insertOne({ email, subscribedAt: new Date() });
    res.json({ success: true, message: "Subscribed successfully" });
  } catch {
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

export default router;
