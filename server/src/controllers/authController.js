import { z } from "zod";
import * as authService from "../services/authService.js";
import * as userRepo from "../repositories/userRepository.js";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["student", "teacher", "parent"]),
  grade: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const register = async (req, res, next) => {
  try {
    res.status(201).json(await authService.register(req.body));
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    res.json(await authService.login(req.body));
  } catch (err) {
    next(err);
  }
};

export const me = (req, res) => {
  const { _id, name, email, role, grade } = req.user;
  res.json({ user: { id: _id, name, email, role, grade } });
};



export const linkChildSchema = z.object({
  childEmail: z.string().email("Invalid child email"),
});

export const linkChild = async (req, res, next) => {
  try {
    const children = await userRepo.findByEmail(req.body.childEmail);
    if (!children || children.role !== "student") {
      const err = new Error("Student not found");
      err.status = 404;
      throw err;
    }
    await userRepo.linkChild(req.user._id, children._id);
    res.json({ message: "Child linked", child: children.name });
  } catch (err) {
    next(err);
  }
};
