import api from './api';

export const getHomeworks = async (status?: string) => {
  const url = status && status !== 'all' ? `/homework?status=${status}` : '/homework';
  const response = await api.get(url);
  return response.data;
};

export const createHomework = async (data: { title: string; description: string; subject: string; dueDate: string; grade?: string }) => {
  const response = await api.post('/homework', data);
  return response.data;
};

export const updateHomeworkStatus = async (id: string, done: boolean) => {
  const response = await api.patch(`/homework/${id}/status`, { done });
  return response.data;
};

export const deleteHomework = async (id: string) => {
  await api.delete(`/homework/${id}`);
};

export const getMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const sendMessage = async (data: { grade: string; body: string; aiAssisted?: boolean }) => {
  const response = await api.post('/messages', data);
  return response.data;
};

export const improveMessageWithAI = async (message: string) => {
  const response = await api.post('/ai/improve-message', { message });
  return response.data;
};

export const askSchoolAI = async (question: string, provider: string) => {
  try {
    const response = await api.post('/ai/ask', { question, prompt: question, provider });
    return response.data.answer || response.data.response || response.data.message;
  } catch {
    const fallback = await api.post('/ai/improve-message', { message: question });
    return fallback.data.improvedMessage || fallback.data.message;
  }
};
