  import React, { createContext, useState, useEffect } from 'react';
  import axiosConfig from './AxiosConfig';

  export const DataContext = createContext();

  export const DataProvider = ({ children }) => {
    const [tests, setTests] = useState([]);
    const [publicTests, setPublicTests] = useState([]);
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    const fetchPublicTests = async () => {
      try {
        const response = await axiosConfig.get(`/api/v0/public-tests/`);
        const testIds = response.data.map(test => test.id);
        const fullTests = await Promise.all(
          testIds.map(async id => {
            const testResponse = await axiosConfig.get(`/api/v0/public-tests/${id}/?detailed=true`);
            return testResponse.data;
          })
        );

        setPublicTests(fullTests);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    const fetchExercises = async () => {
      try {
        const response = await axiosConfig.get("/api/v0/exercises/");
        setExercises(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке упражнений:", error);
      } 
    };
    useEffect(() => {     
      fetchTests();
      fetchPublicTests();
      fetchExercises();
    }, []);

    const refreshTests = async () => {
      setLoading(true);
      await fetchTests();
      setLoading(false);
    }

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
    const addPublicTest = async (testId) => {
      try {
        const response = await axiosConfig.post('api/v0/public-tests/', { test: testId });
        setPublicTests([...publicTests, response.data]);
        return response.data;
      } catch (error) {
        console.error('Ошибка при создании теста', error);
        throw error;
      }
    };

    const findExerciseByName = async (name) => {
      try {
        const response = await axiosConfig.get('/api/v0/exercises/');
        const exercises = response.data;
        return exercises.find(exercise => exercise.name === name);
      } catch (error) {
        console.error('Ошибка при поиске упражнения по имени', error);
        return null;
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
            await deleteExercise(exercise.id)
          }));
        }
        
        await axiosConfig.delete(`/api/v0/tests/${testId}/`);
        
        setTests(tests.filter(test => test.id !== testId));
      } catch (error) {
        setError(error.message);
      }
    };
    


    const deleteExercise = async (exerciseId) => {
      try{
        await axiosConfig.delete(`api/v0/exercises/${exerciseId}/`);
        setExercises(exercises.filter(ex => ex.id !== exerciseId));
      }catch(error){
        setError(error.message);
      }
    }

    

    const getTestById = (id) => {
      return tests.find(test => test.id === parseInt(id));
    }

    return (
      <DataContext.Provider value={{ tests, publicTests,  exercises, loading,  error, deleteTest, deleteExercise,  getTestById, createTest, createExercise, linkExerciseToTest, findExerciseByName, addPublicTest, refreshTests }}>
        {children}
      </DataContext.Provider>
    );
  };
