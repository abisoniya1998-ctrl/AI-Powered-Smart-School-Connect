import User from "../models/User.js";

export const findByEmail = (email) =>
  User.findOne({ email }).select("+password");

export const findById = (id) => User.findById(id);

export const createUser = (data) => User.create(data);

export const findParentsByGrade = async (grade) => {
  const students = await User.find({ role: "student", grade }).select("_id");
  const ids = students.map((s) => s._id);
  return User.find({ role: "parent", children: { $in: ids } }).select("_id");
};

export const linkChild = (parentId, childId) =>
  User.findByIdAndUpdate(
    parentId,
    { $addToSet: { children: childId } },
    { new: true }
  );