import { z } from "zod";
import * as aiService from "../services/aiService.js";

export const improveSchema = z.object({
  draft: z.string().min(5, "Draft is too short").max(2000),
});

export const improve = async (req, res, next) => {
  try {
    const text = await aiService.improveMessage(req.body.draft);
    res.json({ text });
  } catch (err) {
    next(err);
  }
};