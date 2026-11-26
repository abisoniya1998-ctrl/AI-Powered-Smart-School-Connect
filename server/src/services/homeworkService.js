import * as hwRepo from "../repositories/homeworkRepository.js";

const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

const withStatus = (hw, userId) => {
  const obj = hw.toObject();
  obj.status = hw.completedBy.some((id) => id.equals(userId))
    ? "completed"
    : "pending";
  delete obj.completedBy;
  return obj;
};

export const createHomework = (teacher, data) =>
  hwRepo.create({ ...data, teacher: teacher._id });

export const listForUser = async (user, filter) => {
  if (user.role === "teacher") {
    return hwRepo.findByTeacher(user._id);
  }
  if (user.role === "student") {
    const items = await hwRepo.findByGrade(user.grade);
    const mapped = items.map((hw) => withStatus(hw, user._id));
    if (filter === "pending" || filter === "completed") {
      return mapped.filter((hw) => hw.status === filter);
    }
    return mapped;
  }
  throw httpError(403, "Access denied");
};

export const setStatus = async (user, id, done) => {
  const hw = await hwRepo.findById(id);
  if (!hw) throw httpError(404, "Homework not found");
  if (hw.grade !== user.grade) throw httpError(403, "Access denied");
  const updated = done
    ? await hwRepo.markDone(id, user._id)
    : await hwRepo.markPending(id, user._id);
  return withStatus(updated, user._id);
};

export const deleteHomework = async (teacher, id) => {
  const hw = await hwRepo.findById(id);
  if (!hw) throw httpError(404, "Homework not found");
  if (!hw.teacher.equals(teacher._id)) throw httpError(403, "Access denied");
  await hwRepo.remove(id);
};