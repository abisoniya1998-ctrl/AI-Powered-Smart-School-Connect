import Message from "../models/Message.js";

export const create = (data) => Message.create(data);

export const findByTeacher = (teacherId) =>
  Message.find({ teacher: teacherId }).sort({ createdAt: -1 });

export const findForRecipient = (userId) =>
  Message.find({ recipients: userId })
    .populate("teacher", "name")
    .sort({ createdAt: -1 });