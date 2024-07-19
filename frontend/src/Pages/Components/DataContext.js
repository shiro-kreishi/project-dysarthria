import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/v0/tests/");
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
      const response = await axios.post("http://127.0.0.1:8000/api/v0/tests/", test);
      setTests([...tests, response.data]);
    } catch (error) {
      setError(error.message);
    }
  };
  


  return (
    <DataContext.Provider value={{ tests, loading, error, addTest }}>
      {children}
    </DataContext.Provider>
  );
  
};
