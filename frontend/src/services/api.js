import axios from 'axios';
import config from '../config/config';

const getStoredToken = () => {
  try {
    const raw = localStorage.getItem('token');
    if (!raw) return '';
    return String(raw).replace(/^"|"$/g, '');
  } catch {
    return '';
  }
};

const attachAuthToken = (requestConfig) => {
  const token = getStoredToken();
  if (token) {
    requestConfig.headers = requestConfig.headers || {};
    requestConfig.headers.Authorization = `Bearer ${token}`;
  }
  return requestConfig;
};

// Centralized API client used by the workflow pages.
// Base URL is taken from `REACT_APP_API_URL` (fallback: http://localhost:5000).
export const api = axios.create({
  baseURL: config.API_URL,
  headers: { 'Content-Type': 'application/json' },
  // No cookie-based auth is used in this project, so credentials are not needed.
  // Disabling this avoids strict CORS failures that appear as "Network Error".
  withCredentials: false,
});

api.interceptors.request.use(attachAuthToken);

// Backward-compatible client for existing modules that use /api-prefixed helpers.
const API = axios.create({
  baseURL: `${config.API_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

API.interceptors.request.use(attachAuthToken);

// Faculty
export const getFaculties = () => API.get('/faculties');
export const createFaculty = (data) => API.post('/faculties', data);
export const updateFaculty = (id, data) => API.put(`/faculties/${id}`, data);
export const deleteFaculty = (id) => API.delete(`/faculties/${id}`);

// Years
export const getYears = (facultyId) => API.get(`/years/${facultyId}`);
export const createYear = (data) => API.post('/years', data);
export const deleteYear = (id) => API.delete(`/years/${id}`);

// Semesters
export const getSemesters = (yearId) => API.get(`/semesters/${yearId}`);
export const createSemester = (data) => API.post('/semesters', data);
export const deleteSemester = (id) => API.delete(`/semesters/${id}`);

// Modules
export const getModules = (semesterId) => API.get(`/modules/${semesterId}`);
export const createModule = (data) => API.post('/modules', data);
export const updateModule = (id, data) => API.put(`/modules/${id}`, data);
export const deleteModule = (id) => API.delete(`/modules/${id}`);

// Requests
export const getAllRequests = () => API.get('/requests');
export const getRequestsByModule = (moduleId) => API.get(`/requests/module/${moduleId}`);
export const createRequest = (data) => API.post('/requests', data);
export const joinRequest = (id) => API.put(`/requests/${id}/join`);
export const updateRequestStatus = (id, status) => API.put(`/requests/${id}/status`, { status });
export const deleteRequest = (id) => API.delete(`/requests/${id}`);
export const getDashboardStats = () => API.get('/requests/stats/dashboard');

// User Preferences
export const getUserPreference = (userId) => API.get(`/preferences/${userId}`);
export const saveUserPreference = (userId, data) => API.put(`/preferences/${userId}`, data);
export const clearUserPreference = (userId) => API.delete(`/preferences/${userId}`);

// Messages
export const getAllMessages = () => API.get('/messages');
export const createMessage = (data) => API.post('/messages', data);
export const approveMessage = (id) => API.put(`/messages/${id}/approve`);

// Tutor applications
export const getTutorApplications = () => API.get('/tutor-applications');
export const approveTutorApplication = (id, payload = {}) => API.patch(`/tutor-applications/${id}/approve`, payload);
export const rejectTutorApplication = (id, payload = {}) => API.patch(`/tutor-applications/${id}/reject`, payload);

// Chat
export const getAvailableTutors = () => API.get('/chat/tutors');
export const startConversation = (tutorUserId) => API.post('/chat/conversations', { tutorUserId });
export const getUserConversations = () => API.get('/chat/conversations');
export const getConversationMessages = (conversationId, page = 1, limit = 50) =>
  API.get(`/chat/conversations/${conversationId}/messages`, { params: { page, limit } });
export const markMessagesAsRead = (conversationId) => API.put(`/chat/conversations/${conversationId}/read`);
export const deleteConversation = (conversationId) => API.delete(`/chat/conversations/${conversationId}`);
export const sendChatMessage = (conversationId, text, attachments = []) => {
  const formData = new FormData();
  formData.append('conversationId', conversationId);
  formData.append('text', text || '');

  attachments.forEach((file) => {
    formData.append('attachments', file);
  });

  return API.post('/chat/messages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getUnreadCount = (conversationId) => API.get(`/chat/conversations/${conversationId}/unread`);
export const getTotalUnreadCount = () => API.get('/chat/messages/unread/total');
export const deleteChatMessage = (messageId) => API.delete(`/chat/messages/${messageId}`);

export const getApiErrorMessage = (err) => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.response?.data?.success === false && err?.response?.data?.error) return err.response.data.error;
  if (err?.message) return err.message;
  return 'Request failed';
};
