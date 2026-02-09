import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/chats`;

export interface ChatSession {
  id: string; // 16-char string
  title: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChatMessageDto {
  id: number;
  sessionId: string;
  userId: number;
  roleId?: number;
  sender: 'user' | 'ai';
  content: string;
  createdAt: string;
}

export async function listSessions(): Promise<ChatSession[]> {
  const token = localStorage.getItem('token');
  const res = await axios.get<ChatSession[]>(`${API_BASE_URL}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function createSession(): Promise<ChatSession> {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${API_BASE_URL}/create`, undefined, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data as ChatSession;
}

export async function getMessages(chatId: string): Promise<ChatMessageDto[]> {
  const token = localStorage.getItem('token');
  const res = await axios.get<ChatMessageDto[]>(`${API_BASE_URL}/${chatId}/messages`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function addMessage(chatId: string, payload: { sender: 'user' | 'ai'; content: string; roleId?: number }): Promise<ChatMessageDto> {
  const token = localStorage.getItem('token');
  const res = await axios.post<ChatMessageDto>(`${API_BASE_URL}/${chatId}/messages`, payload, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  return res.data;
}

export async function deleteSession(chatId: string): Promise<void> {
  const token = localStorage.getItem('token');
  await axios.delete(`${API_BASE_URL}/${chatId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
}
