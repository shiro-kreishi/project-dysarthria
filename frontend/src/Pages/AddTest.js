import React, { useContext, useState } from 'react';
import { Button, Col, Container, Dropdown, DropdownButton, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import useModal from '../hooks/useModal';
import Modal from './Components/Modal';
import './style.css';
import axiosConfig from './Components/AxiosConfig';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createTest, createExercise, linkExerciseToTest, findExerciseByName, addPublicTest,
  fetchExercises, fetchTestById, fetchPublicTests, updateExercise
} from './Components/api';

const AddTest = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { isActive, openModal, closeModal } = useModal();
  const [selectedType, setSelectedType] = useState('1');
  const [showWordButtons, setShowWordButtons] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isChecked, setIsChecked] = useState(false);

  const queryClient = useQueryClient();

  const saveTestMutation = useMutation(async () => {
    const test = {
      name: document.querySelector('.title-test').value,
      description: 'test'
    };
    const createdTest = await createTest(test);
    const testId = createdTest.id;

    const exercisePromise = exercises.map(async (exercise) => {
      const existingExercise = await findExerciseByName(exercise.name);
      if (existingExercise) {
        await linkExerciseToTest(existingExercise.id, testId);
      } else {
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
    });
    await Promise.all(exercisePromise);
    if (isChecked) {
      await addPublicTest(createdTest.id);
    }

    console.log('Тест и упражнения успешно сохранены');
    localStorage.setItem('testCreated', 'true');
    navigate(`/my-tests/`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('tests');
    }
  });

  const updateExerciseMutation = useMutation(
    (exerciseData) => updateExercise(selectedExercise.id, exerciseData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exercises');
      }
    }
  );

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
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
    console.log(selectedExercise.type);
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

  const handleSaveExercise = () => {
    const exerciseData = {
      name: selectedExercise.name,
      type: selectedExercise.type,
      king_json: selectedExercise.type === '1' ? {
        content: selectedExercise.content,
        missing_words: selectedExercise.missingWords
      } : {
        content: selectedExercise.content,
        answers: selectedExercise.answers,
        correct_answer: selectedExercise.correctAnswer
      }
    };
    updateExerciseMutation.mutate(exerciseData);
  };

  const { data: libraryExercises } = useQuery('exercises', fetchExercises);

  return (
    <div>
      <div className='color-2'>
        <Container>
          <Row>
            <Col></Col>
            <Col>
              <input className='title-test' placeholder={'введите название теста'}></input>
              <p><Button className='btn-blue' onClick={() => saveTestMutation.mutate()}>Сохранить тест и выйти</Button></p>
              <div className='checkbox'>
                <Form.Check
                  type={'checkbox'}
                  id={'default-chekbox'}
                  label={'Сделать публичным'}
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
              </div>
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
            parseInt(selectedExercise.type) === 1 ? (
              <div>
                <h3>Редактор упражнения {selectedExercise.id}</h3>
                <p>Название упражнения <input value={selectedExercise.name} onChange={(e) => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={selectedExercise.description} onChange={(e) => handleExerciseFieldChange(e, "description")} /></p>
                <textarea
                  className=' input-style area-1'
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
                <Row>
                  <Col>
                    <Button onClick={handleSaveExercise}>Сохранить изменения</Button>
                  </Col>
                </Row>
              </div>
            ) : parseInt(selectedExercise.type) == 2 ? (
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
                    <Button onClick={handleSaveExercise}>Сохранить изменения</Button>
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
        <Container className='text-center'>
          <h1>Выберите тип упражнения</h1>
          <Row>
            <Col>
              <DropdownButton id="dropdown-basic-button" title="Создать">
                <Dropdown.Item onClick={() => handleSelectType('1')}>Пропущенные слова</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectType('2')}>Что на изображении</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectType('other')}>Something else</Dropdown.Item>
              </DropdownButton>
            </Col>
            <Col>
              <DropdownButton id="dropdown-basic-button" title="Выбрать из библиотеки">
                {libraryExercises?.map((exercise, index) => (
                  <Dropdown.Item key={index} onClick={() => addExerciseFromLibrary(exercise)}>
                    {exercise.name}
                  </Dropdown.Item>
                ))}
              </DropdownButton>
            </Col>
          </Row>
        </Container>
      </Modal>
    </div>
  );
};

export default AddTest;