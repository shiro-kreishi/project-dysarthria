import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './style.css';
import { Container, Button } from 'react-bootstrap';
import { useQuery } from 'react-query';
import { fetchExerciseById } from './Components/api';
import axiosConfig from './Components/AxiosConfig';

const ExercisePassing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: exercise, isLoading, error } = useQuery(['exercise', id], () => fetchExerciseById(id));
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    if (exercise) {
      setAnswers([{
        id: exercise.id,
        type: exercise.type,
        answer: exercise.type === 1 || exercise.type === 3 ? [] : null
      }]);
    }
  }, [exercise]);

  const handleInputChange = (event, index) => {
    if (exercise) {
      const updatedAnswers = [...answers];
      const answerObj = updatedAnswers.find(a => a.id === exercise.id);
      if (answerObj) {
        answerObj.answer[index] = event.target.value;
        setAnswers(updatedAnswers);
      }
    }
  };

  const handleOptionSelect = (index) => {
    if (exercise) {
      const updatedAnswers = [...answers];
      const answerObj = updatedAnswers.find(a => a.id === exercise.id);
      if (answerObj) {
        answerObj.answer = index;
        setAnswers(updatedAnswers);
      }
    }
  };

  const submitAnswers = async () => {
    const responseExercise = {
      exercise: id,
      date: "2024-08-30", // Заглушка
      response_test: 0, // Здесь что-то должно быть
      json_result: JSON.stringify(answers)
    };

    try {
      await axiosConfig.post('/api/v0/response-exercises/', responseExercise);
      console.log('Ответы успешно отправлены');
      navigate('/library');
    } catch (error) {
      console.error('Ошибка при отправке ответов', error);
    }
  };

  if (isLoading) return <h1>Загрузка</h1>;
  if (error) return <h1>Ошибка {error.message}</h1>;
  if (!exercise) return <h1>Упражнение не найдено</h1>;

  return (
    <div>
      <div className='color-2'>
        <Container>
          <div className='white-text text-center'>
            <h1>{exercise.name}</h1>
          </div>
        </Container>
      </div>
      <Container className='d-flex justify-content-center align-items-center flex-column container-exercise'>
        <h1>{exercise.description}</h1>
        {exercise.type === 1 || exercise.type === 3 ? (
          <div>
            <h2>
              {exercise.king_json?.content.split(/_+/).map((part, idx) => (
                <span key={idx}>
                  {part}
                  {idx < exercise.king_json?.content.match(/_+/g)?.length && (
                    <input
                      type="text"
                      className="input-answer"
                      value={answers.find(a => a.id === exercise.id)?.answer[idx] || ''}
                      onChange={(e) => handleInputChange(e, idx)}
                    />
                  )}
                </span>
              ))}
            </h2>
          </div>
        ) : exercise.type === 2 ? (
          <div>
            {exercise.king_json?.content ? (
              <div>
                <img
                  src={exercise.king_json.content}
                  alt="Изображение упражнения"
                  className="half-size"
                />
                <div className='d-flex justify-content-center mt-3'>
                  {exercise.king_json.answers.map((answ, index) => (
                    <Button
                      key={index}
                      onClick={() => handleOptionSelect(index)}
                      className={`mx-2 ${answers.find(a => a.id === exercise.id)?.answer === index ? 'selected' : ''}`}
                    >
                      {answ}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
        <Button onClick={submitAnswers} className='mt-4'>
          Отправить ответ
        </Button>
      </Container>
    </div>
  );
}

export default ExercisePassing;