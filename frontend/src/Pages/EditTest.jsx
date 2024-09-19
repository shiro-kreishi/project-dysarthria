import React, { useState, useEffect, Fragment } from 'react';
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
  unLinkExerciseToTest,
  deleteTest // Добавьте это
} from './Components/api';

const EditTest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const { isActive, openModal, closeModal } = useModal();
  const [selectedType, setSelectedType] = useState('1');
  const [showWordButtons, setShowWordButtons] = useState(false);
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
      const existingExercise = await findExerciseByName(exercise.name);
      if (existingExercise) {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          description: exercise.description,
          king_json: {
            content: exercise.king_json.content,
            ...(parseInt(exercise.type) === 1 ? { missing_words: exercise.king_json.missing_words } :
            parseInt(exercise.type) === 3 ? { missing_letters: exercise.king_json.missing_letters } :
                { answers: exercise.king_json.answers, correct_answer: exercise.correctAnswer })
          },
          correct_answer: parseInt(exercise.type) === 1 ? (
            exercise.king_json.missing_words?.map(missingWord => missingWord.word) || []
          ) : parseInt(exercise.type) === 1 ? (
            exercise.king_json.missing_letters?.map(missingLetter => missingLetter.word) || []
          ) : (
            [exercise.correctAnswer]
          )
        };
        await updateExercise(existingExercise.id, exerciseData);
      } else {  
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          description: exercise.description,
          king_json: {
            content: exercise.king_json.content,
            ...(exercise.type === '1' ? { missing_words: exercise.king_json.missing_words } :
              exercise.type === '3' ? { missing_letters: exercise.king_json.missing_letters } :
                { answers: exercise.king_json.answers, correct_answer: exercise.correctAnswer })
          },
          correct_answers: exercise.type === '1' ? (
            exercise.king_json.missing_words?.map(missingWord => missingWord.word) || []
          ) : exercise.type === '3' ? (
            exercise.king_json.missing_letters?.map(missingLetter => missingLetter.word) || []
          ) : (
            [exercise.correctAnswer]
          )
        };
        const createdExercise = await createExercise(exerciseData);
        await linkExerciseToTest(createdExercise.id, testId);
      }
    });
    await Promise.all(exercisePromises);
    if (isChecked) {
      await addPublicTest(updatedTest.id);
    }

    console.log('Тест и упражнения успешно сохранены');
    localStorage.setItem('testCreated', 'true');
    navigate(`/my-tests/`);
  }, {
    onSuccess: () => {
      queryClient.invalidateQueries('tests');
    }
  });

  const deleteTestMutation = useMutation(async () => {
    await deleteTest(id);
    navigate('/my-tests/');
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
        const firstExercise = test.exercises[0];
        if (firstExercise.type === '1' && !firstExercise.king_json.missing_words) {
          firstExercise.king_json.missing_words = [];
        } else if (firstExercise.type === '3' && !firstExercise.king_json.missing_letters) {
          firstExercise.king_json.missing_letters = [];
        }
        setSelectedExercise(firstExercise);
      }
    }
  }, [test]);

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const addExercise = (type) => {
    let newExercise;
    if (type === '1') {
      newExercise = {
        id: exercises.length + 1,
        type: type,
        king_json: {
          content: '',
          missing_words: []
        },
        name: '',
        description: ''
      };
    } else if (type === '2') {
      newExercise = { id: exercises.length + 1, type: type, king_json: { content: '', answers: [] }, answers: [], correctAnswer: '', name: '', description: '' };
    } else if (type === '3') {
      newExercise = { id: exercises.length + 1, type: type, king_json: { content: '', missing_letters: [] }, name: '', description: '', answers: [] };
    }
    setExercises([...exercises, newExercise]);
    setSelectedExercise(newExercise);
    closeModal();
  };

  const selectExercise = (exercise) => {
    setSelectedExercise(exercise);
    console.log(selectedExercise);
  };

  const handleSelectType = (type) => {
    setSelectedType(type);
    addExercise(type);
  };

  const handleWordClick = (word, index) => {
    if (!selectedExercise || !selectedExercise.king_json) return;
  
    // Обновляем контент, заменяя выбранное слово подчеркиваниями
    const updatedContent = selectedExercise.king_json.content.replace(word, '_'.repeat(word.length));
  
    // Убеждаемся, что поле missing_words или missing_letters не пропадает
    const updatedExercise = {
      ...selectedExercise,
      king_json: {
        ...selectedExercise.king_json,
        content: updatedContent,
        ...(parseInt(selectedExercise.type) === 1 ? {
          missing_words: selectedExercise.king_json.missing_words.map(missingWord =>
            missingWord.index === index ? { word, index } : missingWord
          ).filter(missingWord => missingWord.index !== index).concat({ word, index })
        } : {
          missing_letters: selectedExercise.king_json.missing_letters.map(missingLetter =>
            missingLetter.index === index ? { word, index } : missingLetter
          ).filter(missingLetter => missingLetter.index !== index).concat({ word, index })
        })
      }
    };
  
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  
    // Вывод в консоль для отладки
    console.log('Exercises:', exercises);
    console.log('Selected Exercise:', selectedExercise);
  };

  const renderContentWithButtonsType1 = (content) => {
    return content.split(' ').map((word, index) => {
      let cleanedWord = word;
      if (".,?!/\\'\"[]()@#$%^&*№;:".includes(word[word.length - 1])) {
        cleanedWord = word.slice(0, -1);
      }

      return (
        <Fragment key={index}>
          <Button
            onClick={() => handleWordClick(cleanedWord, index)}
            style={{ margin: '5px' }}
          >
            {cleanedWord}
          </Button>
        </Fragment>
      );
    });
  };

  const renderContentWithButtonsType3 = (content) => {
    return (
      <>
        {content.split('').map((word, index) => (
          <Button
            key={index}
            onClick={() => handleWordClick(word, index)}
            style={{ margin: '5px' }}
          >
            {word}
          </Button>
        ))}
      </>
    );
  };

  const addAnswer = () => {
    if (!selectedExercise) return;
    const updatedExercise = {
      ...selectedExercise,
      king_json: {
        ...selectedExercise.king_json,
        answers: [...(selectedExercise.king_json.answers || []), '']
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
    const updatedAnswers = [...(selectedExercise.king_json.answers || [])];
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
    setExercises([...exercises, exercise]);
    setSelectedExercise(exercise);
    setSelectedType(exercise.type);
    closeModal();
  };

  const handleSaveExercise = () => {
    if (!selectedExercise) return;
    const exerciseData = {
      name: selectedExercise.name,
      type: selectedExercise.type,
      king_json: selectedExercise.type === '1' || selectedExercise.type === '3' ? {
        content: selectedExercise.king_json.content,
        missing_words: selectedExercise.king_json.missing_words || [],
        missing_letters: selectedExercise.king_json.missing_letters || []
      } : {
        content: selectedExercise.king_json.content,
        answers: selectedExercise.king_json.answers || [],
        correct_answer: selectedExercise.correctAnswer
      },
      correct_answers: selectedExercise.type === '1' ? (
        selectedExercise.king_json.missing_words?.map(missingWord => missingWord.word) || []
      ) : selectedExercise.type === '3' ? (
        selectedExercise.king_json.missing_letters?.map(missingLetter => missingLetter.word) || []
      ) : (
        [selectedExercise.correctAnswer]
      )
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
      <Container className='tale'>
        <Container >
          <Row>
            <h3>Название теста</h3>
              <input
                className='title-test'
                placeholder='введите название теста'
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
              <h3>Описание теста</h3>
              <textarea
                className='description-test'
                placeholder='Введите описание теста'
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
              >
              </textarea>
              <div className='checkbox'>
                <Form.Check
                  type={'checkbox'}
                  id={'default-chekbox'}
                  label={'Сделать публичным'}
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                />
              </div>
              <p>
                <Button className='btn-blue' onClick={() => saveTestMutation.mutate()}>Сохранить изменения и выйти</Button>
                <Button className='btn-red' onClick={() => deleteTestMutation.mutate()}>Удалить тест и выйти</Button>
              </p>
          </Row>
          <Row>
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
          </Row>
        </Container>


      <div className='exercise-editor'>
        <Container>
          {selectedExercise ? (
            parseInt(selectedExercise.type) === 1 ? (
              <div>
                <h3>Редактор упражнения {selectedExercise.id}</h3>
                <p>Название упражнения <input value={selectedExercise.name} onChange={(e) => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={selectedExercise.description} onChange={(e) => handleExerciseFieldChange(e, "description")} /></p>
                <Button onClick={handleSaveExercise}>Сохранить изменения</Button>
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
                    {renderContentWithButtonsType1(selectedExercise.king_json.content)}
                  </div>
                )}
                <Row>
                  <Col>
                    
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
            ) : parseInt(selectedExercise.type) === 3 ? (
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
                    {renderContentWithButtonsType3(selectedExercise.king_json.content)}
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
            ) : null
          ) : (
            <p>Выберите упражнение для редактирования</p>
          )}
        </Container>
      </div>
      </Container>

      <Modal isActive={isActive} closeModal={closeModal}>
        <Container className='text-center'>
          <h1>Выберите тип упражнения</h1>
          <Row>
            <Col>
              <DropdownButton id="dropdown-basic-button" title="Создать">
                <Dropdown.Item onClick={() => handleSelectType('1')} className='btn-blue'>Пропущенные слова</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectType('2')} className='btn-blue'>Что на изображении</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectType('3')} className='btn-blue'>Пропущенные буквы</Dropdown.Item>
              </DropdownButton>
            </Col>
            <Col>
              <DropdownButton id="dropdown-basic-button" title="Выбрать из библиотеки">
                {libraryExercises?.map((exercise, index) => (
                  <Dropdown.Item key={index} onClick={() => addExerciseFromLibrary(exercise)} className='btn-blue'>
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