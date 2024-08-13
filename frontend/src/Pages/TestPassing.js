import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext } from './Components/DataContext';
import './style.css';
import { Container, Button, Row, Col } from 'react-bootstrap';
import { Input } from '@chakra-ui/react';
import axiosConfig from './Components/AxiosConfig';

const TestPassing = () => {
  const { id } = useParams();
  const { getTestById, loading, error } = useContext(DataContext);
  const [test, setTest] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadTest = async () => {
      // Попытка загрузить данные из localStorage
      const localData = localStorage.getItem(`test_${id}`);
      if (localData) {
        const { test, exercises } = JSON.parse(localData);
        setTest(test);
        setExercises(exercises);
        setAnswers(exercises.map(ex => ({
          id: ex.id,
          type: ex.type,
          answer: ex.type === 1 ? [] : null
        })));
        // Удаляем данные из localStorage после загрузки
        localStorage.removeItem(`test_${id}`);
      } else {
        const test = await getTestById(id);
        if (test) { 
          setTest(test);
          if (test.exercises) {
            setExercises(test.exercises);
            setAnswers(test.exercises.map(ex => ({
              id: ex.id,
              type: ex.type,
              answer: ex.type === 1 ? [] : null
            })));
          } else {
            console.error('Test exercises are undefined');
          }
        }
      }
    };
  
    loadTest();
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
      navigate('/my-tests')
    } catch (error) {
      console.error('Ошибка при отправке ответов', error);
    }
  };

  if (loading) return <h1>Загрузка</h1>;
  if (error) return <h1>Ошибка {error}</h1>;
  if (!test) return <h1>Тест не найден</h1>;
  if (!exercises || exercises.length === 0) return <h1>Упражнения не найдены</h1>;

  return (
    <div>
      <div className='color-2'>
        <Container>
          <div className='white-text text-center'>
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
        <Container className='d-flex justify-content-center align-items-center flex-column container-exercise'>
          {selectedExercise ? (
            <div className='text-center'>
              <h1>{selectedExercise.name}</h1>
              {selectedExercise.type === 1 ? (
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
                            onClick={() => handleOptionSelect(index)}
                            className={`mx-2 ${answers.find(a => a.id === selectedExercise.id)?.answer === index ? 'selected' : ''}`}
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