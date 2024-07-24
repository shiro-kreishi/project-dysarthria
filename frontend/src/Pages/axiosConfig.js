import axios from 'axios';

const axiosConfig = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosConfig.defaults.xsrfCookieName = 'csrftoken';
axiosConfig.defaults.xsrfHeaderName = 'X-CSRFToken';
axiosConfig.defaults.withCredentials = true;

export default axiosConfig;
