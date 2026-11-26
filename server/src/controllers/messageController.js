import { z } from "zod";
import * as msgService from "../services/messageService.js";

export const messageSchema = z.object({
  grade: z.string().min(1, "Grade is required"),
  subject: z.string().optional(),
  body: z.string().min(5, "Message is too short"),
  aiAssisted: z.boolean().optional(),
});

export const send = async (req, res, next) => {
  try {
    res.status(201).json(await msgService.sendToGrade(req.user, req.body));
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    res.json(await msgService.listForUser(req.user));
  } catch (err) {
    next(err);
  }
};