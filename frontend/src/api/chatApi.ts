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
  roleId: number;
  message: string;
  model: string;
  modelConfigId?: number;
  sessionId?: string;
}

export interface ChatResponse {
  reply: string;
}

export const sendChatMessage = async (roleId: number, message: string, model: string, modelConfigId?: number, sessionId?: string): Promise<ChatMessage> => {
  try {
    const requestPayload: SendMessageRequest = { roleId, message, model };
    if (modelConfigId) requestPayload.modelConfigId = modelConfigId;
    if (sessionId) requestPayload.sessionId = sessionId;
    console.log('chatApi: Sending request to backend:', requestPayload);
    
  const response = await axios.post<ChatResponse>(`${API_BASE_URL}/generate`, requestPayload);
    
    console.log('chatApi: Backend response:', response.data);
    console.log('chatApi: Status:', response.status);
    
    const chatMessage = {
      id: Date.now().toString(),
      text: response.data.reply,
      sender: 'ai' as const,
      timestamp: new Date(),
    };
    
    console.log('chatApi: Returning ChatMessage:', chatMessage);
    return chatMessage;
  } catch (error) {
    console.error('chatApi: Error occurred:', error);
    if (axios.isAxiosError(error)) {
      console.error('chatApi: Axios error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
    }
    throw new Error('Failed to send message: ' + (error instanceof Error ? error.message : String(error)));
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