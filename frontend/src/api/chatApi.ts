import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/chat';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  role?: string;
  model?: string;
}

export interface SendMessageRequest {
  message: string;
  role: string;
  model: string;
}

export interface ChatResponse {
  message: ChatMessage;
}

export const sendChatMessage = async (message: string, role: string, model: string): Promise<ChatMessage> => {
  try {
    const response = await axios.post<ChatResponse>(`${API_BASE_URL}/send`, {
      message,
      role,
      model,
    });
    return response.data.message;
  } catch (error) {
    throw new Error('Failed to send message');
  }
};

export const getChatHistory = async (role?: string, model?: string): Promise<ChatMessage[]> => {
  try {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (model) params.append('model', model);
    const response = await axios.get<ChatMessage[]>(`${API_BASE_URL}/history?${params}`);
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch chat history');
  }
};