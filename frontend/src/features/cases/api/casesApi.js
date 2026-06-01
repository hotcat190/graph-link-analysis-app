import apiClient from '../../../api/apiClient';

export const getCases = async () => {
  const response = await apiClient.get('/api/cases');
  return response.data;
};

export const createCase = async (caseData, seed = false) => {
  const response = await apiClient.post(`/api/cases?seed=${seed}`, caseData);
  return response.data;
};

export const updateCase = async (id, caseData) => {
  const response = await apiClient.patch(`/api/cases/${id}`, caseData);
  return response.data;
};

export const deleteCase = async (id) => {
  const response = await apiClient.delete(`/api/cases/${id}`);
  return response.data;
};

export const getCaseGraph = async (id) => {
  const response = await apiClient.get(`/api/cases/${id}/graph`);
  return response.data;
};
