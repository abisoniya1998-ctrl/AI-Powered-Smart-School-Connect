import Homework from "../models/Homework.js";

export const create = (data) => Homework.create(data);

export const findByGrade = (grade) =>
  Homework.find({ grade }).sort({ dueDate: 1 });

export const findByTeacher = (teacherId) =>
  Homework.find({ teacher: teacherId }).sort({ dueDate: 1 });

export const findById = (id) => Homework.findById(id);

export const markDone = (id, userId) =>
  Homework.findByIdAndUpdate(
    id,
    { $addToSet: { completedBy: userId } },
    { new: true }
  );

export const markPending = (id, userId) =>
  Homework.findByIdAndUpdate(
    id,
    { $pull: { completedBy: userId } },
    { new: true }
  );

export const remove = (id) => Homework.findByIdAndDelete(id);