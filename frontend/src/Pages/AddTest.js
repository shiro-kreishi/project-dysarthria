import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import './style.css';
import Modal from './Components/Modal';
import axios from 'axios';
import { DataContext } from './Components/DataContext';
import useModal from '../hooks/useModal';

const AddTest = () => {
  const client = axios.create({
    baseURL: "http://127.0.0.1:8000"
  });
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { isActive, openModal, closeModal } = useModal();
  const [selectedType, setSelectedType] = useState('1');   
  const [showWordButtons, setShowWordButtons] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);

  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const csrftoken = getCookie('csrftoken');

  const createTest = async (test) => {
    try {
      const response = await client.post('api/v0/tests/', test, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании теста', error);
      throw error;
    }
  };

  const createExercise = async (exercise) => {
    try {
      const response = await client.post('/api/v0/exercises/', exercise, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании упражнения', error);
      throw error;
    }
  };

  const linkExerciseToTest = async (exerciseId, testId) => {
    try {
      const response = await client.post('/api/v0/exercises-to-test/', {
        exercise: exerciseId,
        test: testId
      }, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Не удалось связать тест и упражнения', error);
      throw error;
    }
  };

  const SaveTest = async () => {
    const test = {
      name: document.querySelector('.title-test').value,
      description: 'test'
    };

    try {
      const createdTest = await createTest(test);
      const testId = createdTest.id;

      for (const exercise of exercises) {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          king_json: exercise.type === '1' ? {
            content: exercise.content,
            missing_words: exercise.missingWords
          } : {
            content: exercise.content,
            answers: exercise.answers,
            correct_answer: exercise.correctAnswer
          }
        };
        const createdExercise = await createExercise(exerciseData);
        await linkExerciseToTest(createdExercise.id, testId);
      }

      console.log('Тест и упражнения успешно сохранены');
      navigate('/my-tests');
    } catch (error) {
      console.error('Ошибка при сохранении теста и упражнений', error);
    }
  };

  const addExercise = (type) => {
    let newExercise;
    if (type === '1') {
      newExercise = { id: exercises.length + 1, type: type, content: '', missingWords: [], name: '', description: '' };
    } else if (type === '2') {
      newExercise = { id: exercises.length + 1, type: type, content: '', answers: [], correctAnswer: '', name: '', description: '' };
    }
    setExercises([...exercises, newExercise]);
    setSelectedExercise(newExercise);
    closeModal();
  };

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    addExercise(type);
  };

  const handleWordClick = (word, index) => {
    const updatedContent = selectedExercise.content.replace(word, '_'.repeat(word.length));
    const updatedExercise = { 
      ...selectedExercise, 
      content: updatedContent,
      missingWords: [...selectedExercise.missingWords, { word, index }]
    };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const renderContentWithButtons = (content) => {
    return content.split(' ').map((word, index) => (
      <Button 
        key={index} 
        onClick={() => handleWordClick(word, index)} 
        style={{ margin: '5px' }}
      >
        {word}
      </Button>
    ));
  };

  const addAnswer = () => {
    const updatedExercise = { 
      ...selectedExercise, 
      answers: [...selectedExercise.answers, '']
    };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const setCorrectAnswer = (answer) => {
    const updatedExercise = { ...selectedExercise, correctAnswer: answer };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const AnswerChange = (index, value) => {
    const updatedAnswers = [...selectedExercise.answers];
    updatedAnswers[index] = value;
    const updatedExercise = { ...selectedExercise, answers: updatedAnswers };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise); 
  };

  const handleExerciseFieldChange = (e, field) => {
    const updatedExercise = { ...selectedExercise, [field]: e.target.value };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };
  

  return (
    <div>
      <div className='color-2'>
        <Container>
          <Row>
            <Col></Col>
            <Col>
              <input className='title-test' placeholder={'введите название теста'}></input>
              <p><Button className='btn-blue' onClick={SaveTest}>Сохранить</Button></p>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className="exercise-nav">
                {exercises.map((exercise, index) => (
                  <Button
                    key={exercise.id}
                    className='exercise-btn'
                    onClick={() => selectExercise(exercise)}
                  >
                    {index + 1}
                  </Button>
                ))}
                <Button className='add-btn' onClick={openModal}>Добавить</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className='exercise-editor'>
        <Container>
          {selectedExercise ? (
            selectedExercise.type === '1' ? (
              <div>
                <h3>Редактор упражнения {selectedExercise.id}</h3>
                <p>Название упражнения <input value={selectedExercise.name} onChange={(e) => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={selectedExercise.description} onChange={(e) => handleExerciseFieldChange(e, "description")} /></p>
                <textarea
                  className='1area'
                  value={selectedExercise.content}
                  onChange={(e) => {
                    const updatedExercise = { ...selectedExercise, content: e.target.value };
                    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
                    setSelectedExercise(updatedExercise);
                  }}
                />
                <Button onClick={() => setShowWordButtons(!showWordButtons)}>
                  {showWordButtons ? 'Скрыть' : 'Выбрать пропущенные'}
                </Button>
                {showWordButtons && (
                  <div>
                    {renderContentWithButtons(selectedExercise.content)}
                  </div>
                )}
              </div>
            ) : selectedExercise.type === '2' ? (
              <div>
                <h3>Редактор изображения {selectedExercise.id}</h3>
                <p>Название упражнения <input value={selectedExercise.name} onChange={e => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={selectedExercise.description} onChange={e => handleExerciseFieldChange(e, "description")} /></p>
                <Row className="align-items-center">
                  <Col>
                    {selectedExercise.content && (
                      <img src={selectedExercise.content} alt="Загруженное изображение" className="half-size" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updatedExercise = { ...selectedExercise, content: reader.result };
                          setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
                          setSelectedExercise(updatedExercise);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p>
                      <Button onClick={addAnswer}>Добавить вариант ответа</Button>
                    </p>
                    <h3>Варианты ответа</h3>
                    {selectedExercise.answers.map((answer, index) => (
                      <div key={index} className="answer-option">
                        <input
                          className='input-style'
                          value={answer}
                          onChange={(e) => AnswerChange(index, e.target.value)}
                        />
                        <Button 
                          onClick={() => setCorrectAnswer(answer)} 
                          className={selectedExercise.correctAnswer === answer ? 'correct-answer' : ''}
                        >
                          {selectedExercise.correctAnswer === answer ? 'Правильный ответ' : 'Выбрать правильный'}
                        </Button>
                      </div>
                    ))}
                  </Col>
                  <Col>
                    
                  </Col>
                </Row>
              </div>
            ) : null
          ) : (
            <p>Выберите упражнение для редактирования</p>
          )}
        </Container>
      </div>

      <Modal isActive={isActive} closeModal={closeModal}>
        <h1>Выберите тип упражнения</h1>
        <DropdownButton id="dropdown-basic-button" title="Тип">
          <Dropdown.Item onClick={() => handleSelectType('1')}>Пропущенные слова</Dropdown.Item>
          <Dropdown.Item onClick={() => handleSelectType('2')}>Что на изображении</Dropdown.Item>
          <Dropdown.Item onClick={() => handleSelectType('other')}>Something else</Dropdown.Item>
        </DropdownButton>
      </Modal>
    </div>
  );
};

export default AddTest;
