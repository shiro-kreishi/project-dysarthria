import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { DataContext } from './Components/DataContext';
import './style.css';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Input } from '@chakra-ui/react';
import axios from 'axios';
import axiosConfig from './Components/AxiosConfig';

const TestPassing = () => {
  const { id } = useParams();
  const { getTestById, loading, error } = useContext(DataContext);
  const [test, setTest] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [answers, setAnswers] = useState([]);

  useEffect(() => {
    const test = getTestById(id);
    if (test) {
      setTest(test);
      setExercises(test.exercises);
      setAnswers(test.exercises.map(ex => ({
        id: ex.id,
        type: ex.type,
        answer: ex.type === 1 ? [] : null
      })));
    }
  }, [id, getTestById]);

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleInputChange = (event, index) => {
    const updatedAnswers = [...answers];
    updatedAnswers.find(a => a.id === selectedExercise.id).answer[index] = event.target.value;
    setAnswers(updatedAnswers);
  };

  const handleOptionSelect = (index) => {
    const updatedAnswers = [...answers];
    updatedAnswers.find(a => a.id === selectedExercise.id).answer = index;
    setAnswers(updatedAnswers);
  };

  const submitAnswers = async () => {
    const responseTest = {
      test: id,
      user: null,  
      json_result: JSON.stringify(answers)
    };

    try {
      const response = await axiosConfig.post('/api/v0/response-tests/', responseTest);
      console.log('Ответы успешно отправлены', response.data);
    } catch (error) {
      console.error('Ошибка при отправке ответов', error);
    }
  };

  if (loading) return <h1>Загрузка</h1>;
  if (error) return <h1>Ошибка {error}</h1>;
  if (!test) return <h1>Тест не найден</h1>;

  return (
    <div>
      <div className='color-2'>
        <Container>
          <div className='white-text'>
            <h1>{test.name}</h1>
            {exercises.map((exercise, index) => (
              <Button
                className='btn-exercise'
                key={exercise.id}
                onClick={() => selectExercise(exercise)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
        </Container>
      </div>
      <div>
        <Container>
          {selectedExercise ? (
            <div>
              <h1>{selectedExercise.name}</h1>
              {selectedExercise.type === 1 ? (
                <div>
                  <h2>
                    {selectedExercise.king_json.content.split(/_+/).map((part, idx) => (
                      <span key={idx}>
                        {part}
                        {idx < selectedExercise.king_json.content.match(/_+/g)?.length && (
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
                  <Button>
                    Ответить
                  </Button>
                </div>
              ) : selectedExercise.type === 2 ? (
                <div>
                  {selectedExercise.king_json.content ? (
                    <div>
                      <img
                        src={selectedExercise.king_json.content}
                        alt="Изображение упражнения"
                        className="half-size"
                      />
                      <div>
                        {selectedExercise.king_json.answers.map((answ, index) => (
                          <Button
                            key={index}
                            onClick={() => handleOptionSelect(index)}
                            className={answers.find(a => a.id === selectedExercise.id)?.answer === index ? 'selected' : ''}
                          >
                            {answ}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
              <Button onClick={submitAnswers}>
                Отправить ответы
              </Button>
            </div>
          ) : null}
        </Container>
      </div>
    </div>
  );
}
export default TestPassing;