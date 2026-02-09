import axios from 'axios';

const API_BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/models`;

export interface ModelConfig {
  id?: number;
  provider: string; // GEMINI
  modelId: string;  // gemini-2.5-pro, etc.
  label?: string;
  userId?: number | null;
  createdAt?: string;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const listModels = async (): Promise<ModelConfig[]> => {
  const res = await axios.get<ModelConfig[]>(API_BASE_URL, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const createModel = async (payload: { provider: string; modelId: string; label?: string; apiKey: string; }): Promise<ModelConfig> => {
  const res = await axios.post<ModelConfig>(API_BASE_URL, payload, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const updateModel = async (id: number, payload: Partial<{ provider: string; modelId: string; label: string; apiKey: string; }>): Promise<ModelConfig> => {
  const res = await axios.patch<ModelConfig>(`${API_BASE_URL}/${id}`, payload, {
    headers: getAuthHeaders()
  });
  return res.data;
};

export const deleteModel = async (id: number): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/${id}`, {
    headers: getAuthHeaders()
  });
};
