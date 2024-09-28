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
    deleteTest
} from './Components/api';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { v4 as uuidv4 } from 'uuid';

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
      const existingExercise = test.exercises.find(ex => ex.id === exercise.id);
      if (existingExercise) {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          description: exercise.description,
          king_json: exercise.type === '1' || exercise.type === '3' ? {
            content: exercise.king_json.content,
            missing_words: exercise.king_json.missing_words || [] // Проверка и инициализация
          } : parseInt(exercise.type) === 4 ? {
            images:exercise.king_json.images || [],
            correct_order: exercise.king_json.correct_order || []
          } : {
            content: exercise.king_json.content,
            answers: exercise.king_json.answers || [],
            correct_answer: exercise.correctAnswer
          },
          correct_answers: parseInt(exercise.type) === 1 ? (
            exercise.king_json.missing_words?.map(missingWord => missingWord.word) || []
          ) : (
            [exercise.correctAnswer]
          )
        };
        await updateExercise(exercise.id, exerciseData);
      } else {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          description: exercise.description,
          king_json: exercise.type === '1' || exercise.type === '3' ? {
            content: exercise.king_json.content,
            missing_words: exercise.king_json.missing_words || [] // Проверка и инициализация
          } : {
            content: exercise.king_json.content,
            answers: exercise.king_json.answers || [],
            correct_answer: exercise.correctAnswer
          },
          correct_answers: parseInt(exercise.type) === 1 ? (
            exercise.king_json.missing_words?.map(missingWord => missingWord.word) || []
          ) : (
            [exercise.correctAnswer]
          )
        };
        const createdExercise = await createExercise(exerciseData);
        console.log(createExercise);
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
        const firstExercise = test.exercises[0];
        if (firstExercise.type === '1' && !firstExercise.king_json.missing_words) {
          firstExercise.king_json.missing_words = [];
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
        id: uuidv4(),
        type: type,
        king_json: {
          content: '',
          missing_words: []
        },
        name: '',
        description: ''
      };
    } else if (type === '2') {
      newExercise = { id: uuidv4(), type: type, king_json: { content: '', answers: [] }, answers: [], correctAnswer: '', name: '', description: '' };
    } else if (type === '3') {
      newExercise = { id: uuidv4(), type: type, king_json: { content: '', missing_words: [] }, name: '', description: '', answers: [] };
    } else if (type === '4') {
      newExercise = { id: uuidv4(), type: type, king_json: { content: '', images: [], correct_order: {} }, name: '', description: '' };
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

    // Убеждаемся, что поле missing_words не пропадает
    const updatedExercise = {
      ...selectedExercise,
      king_json: {
        ...selectedExercise.king_json,
        content: updatedContent,
        missing_words: [...(selectedExercise.king_json.missing_words || []), { word, index }]
      }
    };

    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
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
      king_json: selectedExercise.type === '1' || selectedExercise.type === '3' ? {
        content: selectedExercise.king_json.content,
        missing_words: selectedExercise.king_json.missing_words || []
      } : {
        content: selectedExercise.king_json.content,
        answers: selectedExercise.king_json.answers || [],
        correct_answer: selectedExercise.correctAnswer
      },
      correct_answers: selectedExercise.type === '1' ? (
        selectedExercise.king_json.missing_words?.map(missingWord => missingWord.word) || []
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const updatedImages = [...(selectedExercise.king_json.images || [])];
    const [reorderedImage] = updatedImages.splice(result.source.index, 1);
    updatedImages.splice(result.destination.index, 0, reorderedImage);

    const updatedExercise = { ...selectedExercise, king_json: { ...selectedExercise.king_json, images: updatedImages } };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const handleRemoveImage = (index) => {
    const updatedImages = (selectedExercise.king_json.images || []).filter((_, i) => i !== index);
    const updatedExercise = { ...selectedExercise, king_json: { ...selectedExercise.king_json, images: updatedImages } };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const handleCorrectOrderChange = (index, value) => {
    if (!selectedExercise) return;
    const updatedOrder = { ...selectedExercise.king_json.correct_order };
    updatedOrder[`img${index + 1}`] = value.toString(); // Сохраняем строковое значение
    const updatedExercise = { ...selectedExercise, king_json: { ...selectedExercise.king_json, correct_order: updatedOrder } };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  const handleDeleteTest = async (testId) => {
    if (!testId) return;
    try{
      await deleteTest(testId)
      navigate('/my-tests/')
    } catch (error){
      throw error;
    }
  }

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <div>

        <Container>
          <div className='tale'>
              <h3>Название упражнения</h3>
              <input
                className='title-test'
                placeholder='введите название теста'
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
              />
              <h3>Описание упражнения</h3>
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
         <Row>
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
          </Row>
            </div>
        </Container>
      </div>


      <div className='exercise-editor '>
        <Container className='tale'>
          {selectedExercise ? (
              <div>
                 <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3>Редактор упражнения {selectedExercise.id}</h3>
                    <Button
                      variant="danger"
                      onClick={() => removeExercise(selectedExercise.id)}
                      className="delete-btn"
                      style={{ marginLeft: '10px' }}
                    >
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleSaveExercise}
                      className="save-btn"
                      style={{ marginLeft: '10px' }}
                    >
                    </Button>
                  </div>
<p>Название упражнения <input value={selectedExercise.name} onChange={(e) => handleExerciseFieldChange(e, "name")} />
  {}
</p>
                <p>Описание упражнения <input value={selectedExercise.description} onChange={(e) => handleExerciseFieldChange(e, "description")} /></p>

                {parseInt(selectedExercise.type) === 1 ? (
              <div>
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


                  </Col>
                </Row>
              </div>
            ) : parseInt(selectedExercise.type) == 2 ? (
              <div>
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
                  </Col>
                  <Col>
                  </Col>
                </Row>
              </div>
            ) : parseInt(selectedExercise.type) === 3 ? (
              <div>
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
              </div>
            ) : parseInt(selectedExercise.type) === 4 ? (
              <div>
                <div>
                  <h3>Добавить изображения</h3>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      const readerPromises = Array.from(files).map(file => {
                        return new Promise((resolve, reject) => {
                          const reader = new FileReader();
                          reader.onloadend = () => resolve(reader.result);
                          reader.onerror = reject;
                          reader.readAsDataURL(file);
                        });
                      });
                      Promise.all(readerPromises).then(images => {
                        const updatedExercise = { ...selectedExercise, king_json: { ...selectedExercise.king_json, images: [...(selectedExercise.king_json.images || []), ...images] } };
                        setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
                        setSelectedExercise(updatedExercise);
                      });
                    }}
                  />
                  <div className="image-container">
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="images">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="image-container"
                          >
                            {(selectedExercise.king_json.images || []).map((image, index) => (
                              <Draggable key={index} draggableId={`image-${index}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="image-item"
                                  >
                                    <img
                                      src={image}
                                      alt={`Image ${index}`}
                                      className="image-item"
                                    />
                                    <Button
                                      variant="danger"
                                      onClick={() => handleRemoveImage(index)}
                                      className="delete-btn"
                                    >
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                  <h3>Правильный порядок</h3>
                  <div>
                    {(selectedExercise.king_json.images || []).map((image, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                        <img src={image} alt={`Image ${index}`} className="image-item" />
                        <input
                          type="text"
                          value={selectedExercise.king_json.correct_order[`img${index + 1}`] || ''}
                          onChange={(e) => handleCorrectOrderChange(index, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
                </div>
          ) : (
            <p>Выберите упражнение для редактирования</p>
          )}
          <p><Button className='btn-blue' onClick={() => saveTestMutation.mutate()}>Сохранить тест и выйти</Button> <Button className='btn-red' onClick={() => handleDeleteTest(test.id)}>Удалить тест и выйти</Button></p>
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
                <Dropdown.Item onClick={() => handleSelectType('3')}>Пропущенные буквы</Dropdown.Item>
                <Dropdown.Item onClick={() => handleSelectType('4')}>Расположить изображения</Dropdown.Item>
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