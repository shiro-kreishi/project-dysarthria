import axiosConfig from "./AxiosConfig";

export const fetchTests = async () => {
  try {
    const response = await axiosConfig.get("/api/v0/tests/");
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке тестов', error);
    throw error;
  }
};

export const deleteTest = async (testId) => {
  try {
    await axiosConfig.delete(`/api/v0/tests/${testId}/`);
  } catch (error) {
    console.error('Ошибка при удалении теста', error);
    throw error;
  }
};

export const deleteExercise = async (exerciseId) => {
  try {
    await axiosConfig.delete(`/api/v0/exercises/${exerciseId}/`);
  } catch (error) {
    console.error('Ошибка при удалении упражнения', error);
    throw error;
  }
};

export const fetchPublicTests = async () => {
  try {
    const response = await axiosConfig.get('/api/v0/public-tests/');
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке публичных тестов', error);
    throw error;
  }
};

export const fetchTestById = async (testId) => {
  try {
    const response = await axiosConfig.get(`/api/v0/tests/${testId}/`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке теста по ID', error);
    throw error;
  }
};

export const fetchPublicTestById = async (testId) => {
  try {
    const response = await axiosConfig.get(`/api/v0/public-tests/${testId}/?detailed=true`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке теста по ID', error);
    throw error;
  }
};

export const fetchExercises = async () => {
  try {
    const response = await axiosConfig.get("/api/v0/exercises/");
    return response.data;
  } catch (error) {
    console.error("Ошибка при загрузке упражнений", error);
    throw error;
  }
};

export const createTest = async (test) => {
  try {
    const response = await axiosConfig.post('/api/v0/tests/', test);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании теста', error);
    throw error;
  }
};

export const addPublicTest = async (testId) => {
  try {
    const response = await axiosConfig.post('/api/v0/public-tests/', { test: testId });
    return response.data;
  } catch (error) {
    console.error('Ошибка при добавлении теста в публичные', error);
    throw error;
  }
};

export const findExerciseByName = async (name) => {
  try {
    const response = await axiosConfig.get('/api/v0/exercises/');
    const exercises = response.data;
    return exercises.find(exercise => exercise.name === name);
  } catch (error) {
    console.error('Ошибка при поиске упражнения по имени', error);
    return null;
  }
};

export const createExercise = async (exercise) => {
  try {
    const response = await axiosConfig.post('/api/v0/exercises/', exercise);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании упражнения', error);
    throw error;
  }
};

export const linkExerciseToTest = async (exerciseId, testId) => {
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

export const updateExercise = async (exerciseId, exerciseData) => {
  try {
    const response = await axiosConfig.put(`/api/v0/exercises/${exerciseId}/`, exerciseData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении упражнения', error);
    throw error;
  }
};

export const updateTest = async (testId, testData) => {
  try{
    const response = await axiosConfig.put(`/api/v0/tests/${testId}/`, testData);
    return response.data;
  }catch(error){
    console.error('Ошибка при обновлении теста', error);
    throw error;
  }
}