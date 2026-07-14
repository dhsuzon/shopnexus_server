import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getProductCollection } from "../models/Product.model";
import type { IProduct } from "../models/Product.model";

const toId = (id: string | string[] | undefined): ObjectId => new ObjectId(id as string);

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page = "1",
      limit = "12",
    } = req.query;

    const filter: Record<string, unknown> = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
        { shortDescription: { $regex: search, $options: "i" } },
      ];
    }

    if (category && category !== "all") {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) (filter.price as Record<string, number>).$gte = Number(minPrice);
      if (maxPrice) (filter.price as Record<string, number>).$lte = Number(maxPrice);
    }

    let sortOption: Record<string, 1 | -1> = { createdAt: -1, _id: -1 };
    if (sort === "price_asc") sortOption = { price: 1, _id: 1 };
    else if (sort === "price_desc") sortOption = { price: -1, _id: -1 };
    else if (sort === "rating") sortOption = { rating: -1, _id: -1 };
    else if (sort === "oldest") sortOption = { createdAt: 1, _id: 1 };

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(200, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const col = getProductCollection();
    const [products, total] = await Promise.all([
      col.find(filter).sort(sortOption).skip(skip).limit(limitNum).toArray(),
      col.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const col = getProductCollection();
    const product = await col.findOne({ _id: toId(req.params.id) });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const col = getProductCollection();
    const categories = await col.distinct("category");
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const col = getProductCollection();
    const now = new Date();
    const doc: IProduct = {
      ...req.body,
      createdAt: now,
      updatedAt: now,
    };
    const result = await col.insertOne(doc);
    res.status(201).json({ ...doc, _id: result.insertedId });
  } catch (error) {
    res.status(400).json({ error: "Failed to create product" });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const col = getProductCollection();
    const result = await col.findOneAndUpdate(
      { _id: toId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: "Failed to update product" });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const col = getProductCollection();
    const result = await col.deleteOne({ _id: toId(req.params.id) });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
  }
};

export const getRelatedProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const col = getProductCollection();
    const product = await col.findOne({ _id: toId(req.params.id) });
    if (!product) {
      res.status(404).json({ error: "Product not found" });
      return;
    }
    const related = await col
      .find({ category: product.category, _id: { $ne: product._id } })
      .sort({ rating: -1 })
      .limit(4)
      .toArray();
    res.json(related);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch related products" });
  }
};
