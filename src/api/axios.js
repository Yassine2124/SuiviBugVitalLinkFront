import axios from 'axios';

const api = axios.create({ baseURL: 'https://suivibugvitallink.onrender.com/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data.url;
};

export const uploadDocFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/documents/file', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  return res.data;
};

export default api;