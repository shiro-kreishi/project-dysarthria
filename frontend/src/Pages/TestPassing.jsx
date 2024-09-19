import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './style.css';
import { Container, Button } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { fetchTestById } from './Components/api';
import axiosConfig from './Components/AxiosConfig';

const TestPassing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: test, isLoading, error } = useQuery(['test', id], () => fetchTestById(id));
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const exercises = test?.exercises || [];

  useEffect(() => {
    if (test) {
      setAnswers(test.exercises.map(ex => ({
        id: ex.id,
        type: ex.type,
        answer: ex.type === 1 || ex.type === 3 ? [] : null
      })));
      setStartDate(new Date().toISOString()); // Запуск таймера при загрузке теста
    }
  }, [test]);

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleInputChange = (event, index) => {
    if (selectedExercise) {
      const updatedAnswers = [...answers];
      const answerObj = updatedAnswers.find(a => a.id === selectedExercise.id);
      if (answerObj) {
        answerObj.answer[index] = event.target.value;
        setAnswers(updatedAnswers);
      }
    }
  };

  const handleOptionSelect = (option) => {
    if (selectedExercise) {
      const updatedAnswers = [...answers];
      const answerObj = updatedAnswers.find(a => a.id === selectedExercise.id);
      if (answerObj) {
        answerObj.answer = option;
        setAnswers(updatedAnswers);
      }
    }
  };

  const submitAnswers = async () => {
    setEndDate(new Date().toISOString()); // Остановка таймера при отправке ответов
  
    const jsonResult = answers.map(answer => {
      const exercise = exercises.find(ex => ex.id === answer.id);
      return {
        exercise_id: answer.id,
        user_answer: answer.answer,
        correct_answer: exercise.type === 1 ? (exercise.king_json.missing_words || []).map(wordObj => wordObj.word) :
        exercise.type === 3 ? (exercise.king_json.missing_letters || []).map(letterObj => letterObj.word) :
        exercise.king_json.correct_answer
};
});
  
    const responseTest = {
      test: id,
      user: null,
      json_result: JSON.stringify(jsonResult),
      start_date: startDate,
      end_date: endDate
    };
  
    try {
      await axiosConfig.post('/api/v0/response-tests/', responseTest);
      console.log('Ответы успешно отправлены');
      navigate(`/public-tests/test/result/${id}`, { state: { results: jsonResult } });
    } catch (error) {
      console.error('Ошибка при отправке ответов', error);
    }
  };

  if (isLoading) return <h1>Загрузка</h1>;
  if (error) return <h1>Ошибка {error.message}</h1>;
  if (!test) return <h1>Тест не найден</h1>;
  if (!exercises || exercises.length === 0) return <h1>Упражнения не найдены</h1>;

  return (
    <div>
      <div className='tale'>
        <Container>
          <div className='text-center'>
            <h1>{test.name}</h1>
            <div className="d-flex justify-content-center">
              {exercises.map((exercise, index) => (
                <Button
                  size="lg"
                  className='btn-blue'
                  variant="primary"
                  key={exercise.id}
                  onClick={() => selectExercise(exercise)}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </Container>
      </div>
      <div>
        <Container className='d-flex justify-content-center align-items-center flex-column container-exercise tale'>
          {selectedExercise ? (
            <div className='text-center'>
              <h1>{selectedExercise.name}</h1>
              {selectedExercise.type === 1 || selectedExercise.type === 3 ? (
                <div>
                  <h2>
                    {selectedExercise.king_json?.content.split(/_+/).map((part, idx) => (
                      <span key={idx}>
                        {part}
                        {idx < selectedExercise.king_json?.content.match(/_+/g)?.length && (
                          <input
                            type="text"
                            className="input-answer"
                            value={answers.find(a => a.id === selectedExercise.id)?.answer[idx] || ''}
                            onChange={(e) => handleInputChange(e, idx)}
                          />
                        )}
                      </span>
                    ))}
                  </h2>
                </div>
              ) : selectedExercise.type === 2 ? (
                <div>
                  {selectedExercise.king_json?.content ? (
                    <div>
                      <img
                        src={selectedExercise.king_json.content}
                        alt="Изображение упражнения"
                        className="half-size"
                      />
                      <div className='d-flex justify-content-center mt-3'>
                        {selectedExercise.king_json.answers.map((answ, index) => (
                          <Button
                            key={index}
                            onClick={() => handleOptionSelect(answ)}
                            className={`mx-2 ${answers.find(a => a.id === selectedExercise.id)?.answer === answ ? 'selected' : ''}`}
                          >
                            {answ}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {selectedExercise.id === exercises[exercises.length - 1].id && (
                <Button onClick={submitAnswers} className='mt-4'>
                  Отправить ответы
                </Button>
              )}
            </div>
          ) : null}
        </Container>
      </div>
    </div>
  );
}

export default TestPassing;