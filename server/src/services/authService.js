import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as userRepo from "../repositories/userRepository.js";

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

const toSafeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  grade: user.grade,
});

export const register = async (data) => {
  const existing = await userRepo.findByEmail(data.email);
  if (existing) {
    const err = new Error("Email already registered");
    err.status = 409;
    throw err;
  }
  const hashed = await bcrypt.hash(data.password, 10);
  const user = await userRepo.createUser({ ...data, password: hashed });
  return { token: signToken(user), user: toSafeUser(user) };
};

export const login = async ({ email, password }) => {
  const user = await userRepo.findByEmail(email);
  const valid = user && (await bcrypt.compare(password, user.password));
  if (!valid) {
    const err = new Error("Invalid email or password");
    err.status = 401;
    throw err;
  }
  return { token: signToken(user), user: toSafeUser(user) };
};