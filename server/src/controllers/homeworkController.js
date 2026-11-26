import { z } from "zod";
import * as hwService from "../services/homeworkService.js";

export const homeworkSchema = z.object({
  title: z.string().min(2, "Title is too short"),
  subject: z.string().min(2, "Subject is required"),
  description: z.string().optional(),
  grade: z.string().min(1, "Grade is required"),
  dueDate: z.coerce.date(),
});

export const statusSchema = z.object({
  done: z.boolean(),
});

export const create = async (req, res, next) => {
  try {
    res.status(201).json(await hwService.createHomework(req.user, req.body));
  } catch (err) {
    next(err);
  }
};

export const list = async (req, res, next) => {
  try {
    res.json(await hwService.listForUser(req.user, req.query.status));
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    res.json(await hwService.setStatus(req.user, req.params.id, req.body.done));
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await hwService.deleteHomework(req.user, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};