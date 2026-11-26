export const improveMessage = async (message) => {
  const cleaned = message.trim();
  return `Dear Parent, ${cleaned.charAt(0).toUpperCase() + cleaned.slice(1)}. Thank you for your continued support in your child's education.`;
};
