import * as msgRepo from "../repositories/messageRepository.js";
import * as userRepo from "../repositories/userRepository.js";

export const sendToGrade = async (teacher, { grade, subject, body, aiAssisted }) => {
  const parents = await userRepo.findParentsByGrade(grade);
  const recipients = parents.map((p) => p._id);
  const message = await msgRepo.create({
    teacher: teacher._id,
    grade,
    subject,
    body,
    recipients,
    aiAssisted: !!aiAssisted,
  });
  return { message, recipientCount: recipients.length };
};

export const listForUser = (user) => {
  if (user.role === "teacher") return msgRepo.findByTeacher(user._id);
  return msgRepo.findForRecipient(user._id);
};