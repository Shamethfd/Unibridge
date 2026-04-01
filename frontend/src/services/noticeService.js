import axios from "axios";

const API = "http://localhost:5000/api/notices";

export const createNoticeRequest = async (data) => {
  const res = await axios.post(`${API}/request`, data);
  return res.data;
};

export const getNoticeRequests = async () => {
  const res = await axios.get(`${API}/requests`);
  return res.data;
};

export const approveRequest = async (id) => {
  const res = await axios.put(`${API}/approve/${id}`);
  return res.data;
};

export const rejectRequest = async (id) => {
  const res = await axios.put(`${API}/reject/${id}`);
  return res.data;
};