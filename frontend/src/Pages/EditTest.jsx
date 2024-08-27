import React, { useState, useEffect } from 'react';
import { Button, Col, Container, Row, Form } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from './Components/Modal';
import useModal from '../hooks/useModal';
import './style.css';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchTestById, updateTest, createExercise, linkExerciseToTest, fetchExercises } from './Components/api';

const EditTest = () => {
  const { id } = useParams(); // Получаем ID теста из параметров маршрута
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isActive, openModal, closeModal } = useModal();
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedType, setSelectedType] = useState('1');
  const [showWordButtons, setShowWordButtons] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [exercises, setExercises] = useState([]);
  // Загрузка теста по ID
  const { data: test, isLoading: testLoading } = useQuery(['test', id], () => fetchTestById(id));

  // Загрузка упражнений из библиотеки
  const { data: libraryExercises, isLoading: exercisesLoading } = useQuery('exercises', fetchExercises);

  // Мутация для обновления теста
  const updateTestMutation = useMutation(updateTest, {
    onSuccess: () => {
      queryClient.invalidateQueries(['test', id]);
      navigate('/my-tests');
    }
  });

  useEffect(() => {
    if (test) {
      setExercises(test.exercises || []);
      setIsChecked(test.isPublic || false);
      if (test.exercises.length > 0) {
        setSelectedExercise(test.exercises[0]);
      }
    }
  }, [test]);

  const saveTest = async () => {
    if (test) {
      const updatedTest = { ...test, exercises, isPublic: isChecked };
      updateTestMutation.mutate({ testId: id, test: updatedTest });
    }
  };

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const addExercise = (type) => {
    const newExercise = {
      id: exercises.length + 1,
      type,
      content: '',
      missingWords: [],
      answers: type === '2' ? [] : undefined, // Инициализируем answers только для типа 2
      correctAnswer: '',
      name: '',
      description: ''
    };
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
    if (selectedExercise) {
      const updatedContent = selectedExercise.content.replace(word, '_'.repeat(word.length));
      const updatedExercise = {
        ...selectedExercise,
        content: updatedContent,
        missingWords: [...selectedExercise.missingWords, { word, index }]
      };
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setSelectedExercise(updatedExercise);
    }
  };

  const renderContentWithButtons = (content) => {
    const words = content.split(/(\s+|[.,!?])/).filter(word => word.trim() !== '');
    return words.map((word, index) => {
      if (/[.,!?]/.test(word)) {
        return <span key={index}>{word}</span>;
      }
      return (
        <Button
          key={index}
          onClick={() => handleWordClick(word, index)}
          style={{ margin: '5px' }}
        >
          {word}
        </Button>
      );
    });
  };

  const addAnswer = () => {
    if (selectedExercise) {
      const updatedExercise = {
        ...selectedExercise,
        answers: [...(selectedExercise.answers || []), ''] // Убеждаемся, что answers всегда массив
      };
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setSelectedExercise(updatedExercise);
    }
  };

  const setCorrectAnswer = (answer) => {
    if (selectedExercise) {
      const updatedExercise = { ...selectedExercise, correctAnswer: answer };
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setSelectedExercise(updatedExercise);
    }
  };

  const answerChange = (index, value) => {
    if (selectedExercise) {
      const updatedAnswers = [...(selectedExercise.answers || [])]; // Убеждаемся, что answers всегда массив
      updatedAnswers[index] = value;
      const updatedExercise = { ...selectedExercise, answers: updatedAnswers };
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setSelectedExercise(updatedExercise);
    }
  };

  const handleExerciseFieldChange = (e, field) => {
    if (selectedExercise) {
      const updatedExercise = { ...selectedExercise, [field]: e.target.value };
      setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
      setSelectedExercise(updatedExercise);
    }
  };

  const convertLibraryExercise = (exercise) => {
    return {
      id: exercise.id,
      type: exercise.type,
      content: exercise.king_json.content,
      missingWords: exercise.king_json.missing_words || [],
      answers: exercise.king_json.answers || [],
      correctAnswer: exercise.king_json.correct_answer || '',
      name: exercise.name,
      description: exercise.description
    };
  };

  const addExerciseFromLibrary = (exercise) => {
    const convertedExercise = convertLibraryExercise(exercise);
    setExercises([...exercises, convertedExercise]);
    setSelectedExercise(convertedExercise);
    setSelectedType(convertedExercise.type);
    closeModal();
  };

  if (testLoading || exercisesLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className='color-2'>
        <Container>
          <Row>
            <Col>
              <input
                className='title-test'
                value={test?.name || ''}
                onChange={(e) => {
                  if (test) {
                    const updatedTest = { ...test, name: e.target.value };
                    updateTestMutation.mutate({ testId: id, test: updatedTest });
                  }
                }}
                placeholder='Введите название теста'
              />
              <p>
                <Button className='btn-blue' onClick={saveTest} disabled={updateTestMutation.isLoading}>
                  {updateTestMutation.isLoading ? 'Сохранение...' : 'Сохранить тест и выйти'}
                </Button>
              </p>
              <div className='checkbox'>
                <Form.Check
                  type='checkbox'
                  id='default-checkbox'
                  label='Сделать публичным'
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              <div className='exercise-nav'>
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
            parseInt(selectedExercise.type) === 1 ? (
              <div>
                <h3>Редактор упражнения {selectedExercise.id}</h3>
                <p>
                  Название упражнения
                  <input
                    value={selectedExercise.name}
                    onChange={(e) => handleExerciseFieldChange(e, 'name')}
                  />
                </p>
                <p>
                  Описание упражнения
                  <input
                    value={selectedExercise.description}
                    onChange={(e) => handleExerciseFieldChange(e, 'description')}
                  />
                </p>
                <textarea
                  className='input-style area-1'
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
            ) : parseInt(selectedExercise.type) === 2 ? (
              <div>
                <h3>Редактор изображения {selectedExercise.id}</h3>
                <p>
                  Название упражнения
                  <input
                    value={selectedExercise.name}
                    onChange={(e) => handleExerciseFieldChange(e, 'name')}
                  />
                </p>
                <p>
                  Описание упражнения
                  <input
                    value={selectedExercise.description}
                    onChange={(e) => handleExerciseFieldChange(e, 'description')}
                  />
                </p>
                <Row className='align-items-center'>
                  <Col>
                    {selectedExercise.content && (
                      <img
                        src={selectedExercise.content}
                        alt='Загруженное изображение'
                        className='half-size'
                      />
                    )}
                    <input
                      type='file'
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
                    {(selectedExercise.answers || []).map((answer, index) => ( // Убеждаемся, что answers всегда массив
                      <div key={index} className='answer-option'>
                        <input
                          className='input-style'
                          value={answer}
                          onChange={(e) => answerChange(index, e.target.value)}
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
                </Row>
              </div>
            ) : null
          ) : (
            <p>Выберите упражнение для редактирования</p>
          )}
        </Container>
      </div>
      <Modal isActive={isActive} closeModal={closeModal}>
        <Container className='text-center'>
          <h1>Выберите тип упражнения</h1>
          <Row>
            <Col>
              <Button onClick={() => handleSelectType('1')}>Пропущенные слова</Button>
              <Button onClick={() => handleSelectType('2')}>Что на изображении</Button>
            </Col>
            <Col>
              <Button onClick={openModal}>Выбрать из библиотеки</Button>
              {libraryExercises?.map((exercise, index) => (
                <Button key={index} onClick={() => addExerciseFromLibrary(exercise)}>
                  {exercise.name}
                </Button>
              ))}
            </Col>
          </Row>
        </Container>
      </Modal>
    </div>
  );
};

export default EditTest;