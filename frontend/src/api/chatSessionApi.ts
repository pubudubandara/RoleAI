import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/chats';

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
  const res = await axios.get<ChatSession[]>(`${API_BASE_URL}`);
  return res.data;
}

export async function createSession(): Promise<ChatSession> {
  const res = await axios.post(`${API_BASE_URL}/create`);
  return res.data as ChatSession;
}

export async function getMessages(chatId: string): Promise<ChatMessageDto[]> {
  const res = await axios.get<ChatMessageDto[]>(`${API_BASE_URL}/${chatId}/messages`);
  return res.data;
}

export async function addMessage(chatId: string, payload: { sender: 'user' | 'ai'; content: string; roleId?: number }): Promise<ChatMessageDto> {
  const res = await axios.post<ChatMessageDto>(`${API_BASE_URL}/${chatId}/messages`, payload);
  return res.data;
}

export async function deleteSession(chatId: string): Promise<void> {
  await axios.delete(`${API_BASE_URL}/${chatId}`);
}
