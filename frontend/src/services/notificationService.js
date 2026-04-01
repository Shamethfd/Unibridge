import axios from "axios";

const API = "http://localhost:5000/api/notifications";

export const getNotifications = async () => {
  const res = await axios.get(API);
  return res.data;
};