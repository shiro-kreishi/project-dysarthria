import React, { useContext, useState, useEffect } from 'react';
import { Button, Col, Container, Dropdown, DropdownButton, Form, Row } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import useModal from '../hooks/useModal';
import Modal from './Components/Modal';
import './style.css';
import axiosConfig from './Components/AxiosConfig';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createTest, createExercise, linkExerciseToTest, findExerciseByName, addPublicTest,
  fetchExercises, fetchTestById, fetchPublicTests, updateExercise,
  updateTest,
  unLinkExerciseToTest
} from './Components/api';

const EditTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { isActive, openModal, closeModal } = useModal();
  const [selectedType, setSelectedType] = useState('1');
  const [showWordButtons, setShowWordButtons] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [testTitle, setTestTitle] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const { data: test, isLoading, error } = useQuery(['test', id], () => fetchTestById(id));
  const queryClient = useQueryClient();

  const updateExerciseMutation = useMutation(
    (exerciseData) => updateExercise(selectedExercise.id, exerciseData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exercises');
      }
    }
  );

  const saveTestMutation = useMutation(async () => {
    const testData = {
      name: testTitle,
      description: testDescription
    };
    const updatedTest = await updateTest(id, testData);
    const testId = updatedTest.id;

    const exercisePromises = exercises.map(async (exercise) => {
      const existingExercise = test.exercises.find(ex => ex.id === exercise.id);
      if (existingExercise) {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          king_json: exercise.type === '1' ? {
            content: exercise.king_json.content,
            missing_words: exercise.king_json.missing_words
          } : {
            content: exercise.king_json.content,
            answers: exercise.king_json.answers,
            correct_answer: exercise.correctAnswer
          }
        };
        await updateExercise(exercise.id, exerciseData);
      } else {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          king_json: exercise.type === '1' ? {
            content: exercise.king_json.content,
            missing_words: exercise.king_json.missing_words
          } : {
            content: exercise.king_json.content,
            answers: exercise.king_json.answers,
            correct_answer: exercise.correctAnswer
          }
        };
        const createdExercise = await createExercise(exerciseData);
        await linkExerciseToTest(createdExercise.id, testId);
      }
    });

    await Promise.all(exercisePromises);
    if (isChecked) {
      await addPublicTest(testId);
    }

    console.log('Тест и упражнения успешно сохранены');
    navigate(`/my-tests/`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('tests');
    }
  });

  useEffect(() => {
    if (test && test.name) {
      setTestTitle(test.name);
      setTestDescription(test.description);
      setExercises(test.exercises || []);
      if (test.exercises && test.exercises.length > 0) {
        setSelectedExercise(test.exercises[0]);
      }
    }
  }, [test]);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const addExercise = (type) => {
    let newExercise;
    if (type === '1') {
      newExercise = { id: exercises.length + 1, type: type, king_json: { content: '', missing_words: [] }, name: '', description: '', answers: [] };
    } else if (type === '2') {
      newExercise = { id: exercises.length + 1, type: type, king_json: { content: '', answers: [] }, answers: [], correctAnswer: '', name: '', description: '' };
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
    if (!selectedExercise) return;
    const updatedContent = selectedExercise.king_json.content.replace(word, '_'.repeat(word.length));
    const updatedExercise = {
      ...selectedExercise,
      king_json: {
        ...selectedExercise.king_json,
        content: updatedContent,
        missing_words: [...selectedExercise.king_json.missing_words, { word, index }]
      }
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
    if (!selectedExercise) return;
    const updatedExercise = {
      ...selectedExercise,
      king_json: {
        ...selectedExercise.king_json,
        answers: [...selectedExercise.king_json.answers, '']
      }
    };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const setCorrectAnswer = (answer) => {
    if (!selectedExercise) return;
    const updatedExercise = { ...selectedExercise, correctAnswer: answer };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const AnswerChange = (index, value) => {
    if (!selectedExercise) return;
    const updatedAnswers = [...selectedExercise.king_json.answers];
    updatedAnswers[index] = value;
    const updatedExercise = {
      ...selectedExercise,
      king_json: {
        ...selectedExercise.king_json,
        answers: updatedAnswers
      }
    };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const handleExerciseFieldChange = (e, field) => {
    if (!selectedExercise) return;
    const updatedExercise = { ...selectedExercise, [field]: e.target.value };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const addExerciseFromLibrary = (exercise) => {
    const convertedExercise = {
      id: exercise.id,
      type: exercise.type,
      king_json: {
        content: exercise.king_json.content,
        missing_words: exercise.king_json.missing_words || [],
        answers: exercise.king_json.answers || []
      },
      correctAnswer: exercise.king_json.correct_answer || '',
      name: exercise.name,
      description: exercise.description
    };
    setExercises([...exercises, convertedExercise]);
    setSelectedExercise(convertedExercise);
    setSelectedType(convertedExercise.type);
    closeModal();
  };

  const handleSaveExercise = () => {
    if (!selectedExercise) return;
    const exerciseData = {
      name: selectedExercise.name,
      type: selectedExercise.type,
      king_json: selectedExercise.type === '1' ? {
        content: selectedExercise.king_json.content,
        missing_words: selectedExercise.king_json.missing_words
      } : {
        content: selectedExercise.king_json.content,
        answers: selectedExercise.king_json.answers,
        correct_answer: selectedExercise.correctAnswer
      }
    };
    updateExerciseMutation.mutate(exerciseData);
  };

  const removeExercise = (exerciseId) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
    unLinkExerciseToTest(exerciseId, test.id);
    setSelectedExercise(null);
    
  };

  const { data: libraryExercises } = useQuery('exercises', fetchExercises);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div className='color-2'>
        <Container>
          <Row>
            <Col></Col>
            <Col>
              <input
                className='title-test'
                placeholder='введите название теста'
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
              <textarea 
                className='description-test'
                placeholder='Введите описание теста'
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                >
                
                
              </textarea>
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
                  <div key={exercise.id} className="exercise-btn-wrapper">
                    <Button
                      className='exercise-btn'
                      onClick={() => selectExercise(exercise)}
                    >
                      {index + 1}
                    </Button>
                  </div>
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
                  value={selectedExercise.king_json.content}
                  onChange={(e) => {
                    const updatedExercise = {
                      ...selectedExercise,
                      king_json: {
                        ...selectedExercise.king_json,
                        content: e.target.value
                      }
                    };
                    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
                    setSelectedExercise(updatedExercise);
                  }}
                />
                <Button onClick={() => setShowWordButtons(!showWordButtons)}>
                  {showWordButtons ? 'Скрыть' : 'Выбрать пропущенные'}
                </Button>
                {showWordButtons && (
                  <div>
                    {renderContentWithButtons(selectedExercise.king_json.content)}
                  </div>
                )}
                <Row>
                  <Col>
                    <Button onClick={handleSaveExercise}>Сохранить изменения</Button>
                    <Button
                      variant="danger"
                      onClick={() => removeExercise(selectedExercise.id)}
                      className="delete-btn"
                    >
                      X
                    </Button>
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
                    {selectedExercise.king_json.content && (
                      <img src={selectedExercise.king_json.content} alt="Загруженное изображение" className="half-size" />
                    )}
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          const updatedExercise = {
                            ...selectedExercise,
                            king_json: {
                              ...selectedExercise.king_json,
                              content: reader.result
                            }
                          };
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
                    {selectedExercise.king_json.answers?.map((answer, index) => (
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
                    <Button
                      variant="danger"
                      onClick={() => removeExercise(selectedExercise.id)}
                      className="delete-btn"
                    >
                      X
                    </Button>
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

export default EditTest;