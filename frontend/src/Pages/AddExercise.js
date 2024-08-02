import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import './style.css';
import Modal from './Components/Modal';
import axios from 'axios';
import { DataContext } from './Components/DataContext';
import useModal from '../hooks/useModal';

const AddExercise = () => {
  const client = axios.create({
    baseURL: "http://127.0.0.1:8000"
  });
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const { isActive, openModal, closeModal } = useModal();
  const [selectedType, setSelectedType] = useState(null);   
  const [showWordButtons, setShowWordButtons] = useState(false);
  const { createExercise } = useContext(DataContext);

  useEffect(() => {
    openModal();
  }, []);

  const saveExercise = async () => {
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

    try {
      await createExercise(exerciseData);
      console.log('Упражнение успешно сохранено');
      navigate('/library');
    } catch (error) {
      console.error('Ошибка при сохранении упражнения', error);
    }
  };

  const addExercise = (type) => {
    let newExercise;
    if (type === '1') {
      newExercise = { id: 1, type: type, content: '', missingWords: [], name: '', description: '' };
    } else if (type === '2') {
      newExercise = { id: 1, type: type, content: '', answers: [], correctAnswer: '', name: '', description: '' };
    }
    setExercise(newExercise);
    closeModal();
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    addExercise(type);
  };

  const handleWordClick = (word, index) => {
    const updatedContent = exercise.content.replace(word, '_'.repeat(word.length));
    const updatedExercise = { 
      ...exercise, 
      content: updatedContent,
      missingWords: [...exercise.missingWords, { word, index }]
    };
    setExercise(updatedExercise);
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
      ...exercise, 
      answers: [...exercise.answers, '']
    };
    setExercise(updatedExercise);
  };

  const setCorrectAnswer = (answer) => {
    const updatedExercise = { ...exercise, correctAnswer: answer };
    setExercise(updatedExercise);
  };

  const answerChange = (index, value) => {
    const updatedAnswers = [...exercise.answers];
    updatedAnswers[index] = value;
    const updatedExercise = { ...exercise, answers: updatedAnswers };
    setExercise(updatedExercise); 
  };

  const handleExerciseFieldChange = (e, field) => {
    const updatedExercise = { ...exercise, [field]: e.target.value };
    setExercise(updatedExercise);
  };

  return (
    <div>
      <div className='color-2'>
        <Container>
          <Row>
            <Col></Col>
            <Col>
              <p><Button className='btn-blue' onClick={saveExercise}>Сохранить</Button></p>
            </Col>
          </Row>
        </Container>
      </div>

      <div className='exercise-editor'>
        <Container>
          {exercise ? (
            exercise.type === '1' ? (
              <div>
                <h3>Редактор упражнения {exercise.id}</h3>
                <p>Название упражнения <input value={exercise.name} onChange={(e) => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={exercise.description} onChange={(e) => handleExerciseFieldChange(e, "description")} /></p>
                <textarea
                  className=' input-style area-1'
                  value={exercise.content}
                  onChange={(e) => {
                    const updatedExercise = { ...exercise, content: e.target.value };
                    setExercise(updatedExercise);
                  }}
                />
                <Button onClick={() => setShowWordButtons(!showWordButtons)}>
                  {showWordButtons ? 'Скрыть' : 'Выбрать пропущенные'}
                </Button>
                {showWordButtons && (
                  <div>
                    {renderContentWithButtons(exercise.content)}
                  </div>
                )}
              </div>
            ) : exercise.type === '2' ? (
              <div>
                <h3>Редактор изображения {exercise.id}</h3>
                <p>Название упражнения <input value={exercise.name} onChange={e => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={exercise.description} onChange={e => handleExerciseFieldChange(e, "description")} /></p>
                <Row className="align-items-center">
                  <Col>
                    {exercise.content && (
                      <img src={exercise.content} alt="Загруженное изображение" className="half-size" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updatedExercise = { ...exercise, content: reader.result };
                          setExercise(updatedExercise);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    <p>
                      <Button onClick={addAnswer}>Добавить вариант ответа</Button>
                    </p>
                    <h3>Варианты ответа</h3>
                    {exercise.answers.map((answer, index) => (
                      <div key={index} className="answer-option">
                        <input
                          className='input-style'
                          value={answer}
                          onChange={(e) => answerChange(index, e.target.value)}
                        />
                        <Button 
                          onClick={() => setCorrectAnswer(answer)} 
                          className={exercise.correctAnswer === answer ? 'correct-answer' : ''}
                        >
                          {exercise.correctAnswer === answer ? 'Правильный ответ' : 'Выбрать правильный'}
                        </Button>
                      </div>
                    ))}
                  </Col>
                </Row>
              </div>
            ) : null
          ) : (
            <p>Выберите тип упражнения</p>
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

export default AddExercise;
