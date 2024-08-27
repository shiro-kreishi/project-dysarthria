import { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import axiosConfig from '../Pages/Components/AxiosConfig';

const fetchPermissions = async () => {
  try {
    const response = await axiosConfig.get("/api/user/check-user-permissions/");
    return response.data;
  } catch (error) {
    // Если ошибка 403, возвращаем объект с access: "deny"
    if (error.response && error.response.status === 403) {
      return { access: "deny" };
    }
    throw error; // Перебрасываем ошибку, если это не 403
  }
};

const usePermissions = () => {
  const [isAllowed, setIsAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { data, isLoading: queryLoading, error } = useQuery('permissions', fetchPermissions, {
    retry: false,
    onSuccess: (data) => {
      localStorage.setItem('userPermissions', JSON.stringify(data));
      setIsAllowed(data.access === "allow");
    },
    onError: (error) => {
      console.error("Error fetching permissions:", error);
    }
  });

  useEffect(() => {
    const permissions = localStorage.getItem('userPermissions');
    if (permissions) {
      const parsedPermissions = JSON.parse(permissions);
      setIsAllowed(parsedPermissions.access === "allow");
    }
    setIsLoading(false);
  }, []);

  return { isAllowed, isLoading: isLoading || queryLoading, error };
};

export default usePermissions;