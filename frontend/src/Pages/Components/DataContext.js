import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import axiosConfig from './AxiosConfig';
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axiosConfig.get("/api/v0/tests/");
        setTests(response.data);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  const addTest = async (test) => {
    try {
      const response = await axiosConfig.post("/api/v0/tests/", test);
      setTests([...tests, response.data]);
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteTest = async (testId) => {
    try {
      await axiosConfig.delete(`/api/v0/tests/${testId}/`);
      setTests(tests.filter(test => test.id !== testId));
    } catch (error) {
      setError(error.message);
    }
  };
  


  return (
    <DataContext.Provider value={{ tests, loading, error, addTest, deleteTest }}>
      {children}
    </DataContext.Provider>
  );
  
};
