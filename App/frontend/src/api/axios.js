import axios from 'axios';

// withCredentials: true → browser sends the HttpOnly cookie on every request
const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

export default api;
