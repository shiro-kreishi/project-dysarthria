import React, { createContext, useState, useEffect } from 'react';
import axiosConfig from './AxiosConfig';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [tests, setTests] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axiosConfig.get("/api/v0/tests/");
        const testIds = response.data.map(test => test.id);
        const fullTests = await Promise.all(
          testIds.map(async id => {
            const testResponse = await axiosConfig.get(`/api/v0/tests/${id}/`);
            return testResponse.data;
          })
        );

        setTests(fullTests);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchTests();
  }, []);



  // const addTest = async (test) => {
  //   try {
  //     const response = await axiosConfig.post("/api/v0/tests/", test);
  //     const newTest = await axiosConfig.get(`/api/v0/tests/${response.data.id}/`);
  //     setTests([...tests, newTest.data]);
  //   } catch (error) {
  //     setError(error.message);
  //   }
  // };

  const createTest = async (test) => {
    try {
      const response = await axiosConfig.post('api/v0/tests/', test);
      setTests([...tests, response.data]);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании теста', error);
      throw error;
    }
  };
  
  const createExercise = async (exercise) => {
    try {
      const response = await axiosConfig.post('/api/v0/exercises/', exercise);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании упражнения', error);
      throw error;
    }
  };

  const linkExerciseToTest = async (exerciseId, testId) => {
    try {
      const response = await axiosConfig.post('/api/v0/exercises-to-test/', {
        exercise: exerciseId,
        test: testId
      });
      return response.data;
    } catch (error) {
      console.error('Не удалось связать тест и упражнения', error);
      throw error;
    }
  };

  const deleteTest = async (testId) => {
    try {
      // Fetch the test object
      const test = tests.find(t => t.id === testId);
      if (test && test.exercises && test.exercises.length > 0) {
        // Delete each exercise associated with the test
        await Promise.all(test.exercises.map(async (exercise) => {
          await axiosConfig.delete(`/api/v0/exercises/${exercise.id}/`);
        }));
      }
      
      await axiosConfig.delete(`/api/v0/tests/${testId}/`);
      
      setTests(tests.filter(test => test.id !== testId));
    } catch (error) {
      setError(error.message);
    }
  };
  

  

  const getTestById = (id) => {
    return tests.find(test => test.id === parseInt(id));
  }

  return (
    <DataContext.Provider value={{ tests, loading, error, deleteTest, getTestById, createTest, createExercise, linkExerciseToTest }}>
      {children}
    </DataContext.Provider>
  );
};
