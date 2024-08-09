import axios from "axios";

const getCSRFToken = () => {
    const cookieValue = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken'))
      ?.split('=')[1];
    return cookieValue;
  };
  const axiosConfig = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        'X-CSRFToken': getCSRFToken(),
        'Content-Type': 'application/json',
      },
      withCredentials: true,
  });

  export default axiosConfig;

