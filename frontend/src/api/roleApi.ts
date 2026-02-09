import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api/roles`;

export interface Role {
  id?: number;
  name: string;
  description: string;
  userId?: number;
}

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create axios instance with auth headers
const createAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Get all roles for current user
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    const response = await axios.get(API_URL, {
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Get role by ID
export const getRoleById = async (id: number): Promise<Role> => {
  try {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
};

// Create new role
export const createRole = async (role: Omit<Role, 'id' | 'userId'>): Promise<Role> => {
  try {
    const response = await axios.post(API_URL, role, {
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

// Update existing role
export const updateRole = async (id: number, role: Omit<Role, 'id' | 'userId'>): Promise<Role> => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, role, {
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: createAuthHeaders()
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

// Search roles by name
export const searchRoles = async (query: string): Promise<Role[]> => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { query },
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error searching roles:', error);
    throw error;
  }
};

// Find similar roles using AI vector search
export const findSimilarRoles = async (description: string, limit: number = 5): Promise<Role[]> => {
  try {
    const response = await axios.post(`${API_URL}/similar`, description, {
      params: { limit },
      headers: createAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error finding similar roles:', error);
    throw error;
  }
};
