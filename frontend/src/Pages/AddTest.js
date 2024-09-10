import React, { useContext, useState, Fragment } from 'react';
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
  const [isChecked, setIsChecked] = useState(false);

  const queryClient = useQueryClient();

  const saveTestMutation = useMutation(async () => {
    const test = {
      name: document.querySelector('.title-test').value,
      description: document.querySelector('.description-test').value
    };
    const createdTest = await createTest(test);
    const testId = createdTest.id;

    const exercisePromises = exercises.map(async (exercise) => {
      const existingExercise = await findExerciseByName(exercise.name);
      if (existingExercise) {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          description: exercise.description,
          king_json: {
            content: exercise.content,
            ...(exercise.type === '1' ? { missing_words: exercise.missingWords } :
              exercise.type === '3' ? { missing_letters: exercise.missingWords } :
                { answers: exercise.answers, correct_answer: exercise.correctAnswer })
          },
          correct_answers: exercise.type === '1' ? (
            exercise.missingWords.map(missingWord => missingWord.word)
          ) : exercise.type === '3' ? (
            exercise.missingWords.map(missingWord => missingWord.word)
          ) : (
            [exercise.correctAnswer]
          )
        };
        await updateExercise(existingExercise.id, exerciseData);
        await linkExerciseToTest(existingExercise.id, testId);
      } else {
        const exerciseData = {
          name: exercise.name,
          type: exercise.type,
          description: exercise.description,
          king_json: {
            content: exercise.content,
            ...(exercise.type === '1' ? { missing_words: exercise.missingWords } :
              exercise.type === '3' ? { missing_letters: exercise.missingWords } :
                { answers: exercise.answers, correct_answer: exercise.correctAnswer })
          },
          correct_answers: exercise.type === '1' ? (
            exercise.missingWords.map(missingWord => missingWord.word)
          ) : exercise.type === '3' ? (
            exercise.missingWords.map(missingWord => missingWord.word)
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

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  const addExercise = (type) => {
    let newExercise;
    if (type === '1') {
      newExercise = { id: exercises.length + 1, type: type, content: '', missingWords: [], name: '', description: '' };
    } else if (type === '2') {
      newExercise = { id: exercises.length + 1, type: type, content: '', answers: [], correctAnswer: '', name: '', description: '' };
    } else if (type === '3') {
      newExercise = { id: exercises.length + 1, type: type, content: '', missingWords: [], name: '', description: '' };
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
    if (!selectedExercise) return;
    const updatedContent = selectedExercise.content.replace(word, '_'.repeat(word.length));
    const updatedExercise = {
      ...selectedExercise,
      content: updatedContent,
      missingWords: [...selectedExercise.missingWords, { word, index }]
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
      answers: [...selectedExercise.answers, '']
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
    const updatedAnswers = [...selectedExercise.answers];
    updatedAnswers[index] = value;
    const updatedExercise = { ...selectedExercise, answers: updatedAnswers };
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
      content: exercise.king_json.content,
      missingWords: exercise.king_json.missing_words || [],
      answers: exercise.king_json.answers || [],
      correctAnswer: exercise.king_json.correct_answer || '',
      name: exercise.name,
      description: exercise.description
    };
    setExercises([...exercises, convertedExercise]);
    setSelectedExercise(convertedExercise);
    setSelectedType(convertedExercise.type);
    closeModal();
  };

  const updateExerciseMutation = useMutation(
    ({ exerciseId, exerciseData }) => updateExercise(exerciseId, exerciseData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('exercises');
      },
    }
  );

  const handleSaveExercise = () => {
    if (!selectedExercise) return;
    const exerciseData = {
      name: selectedExercise.name,
      type: selectedExercise.type,
      king_json: selectedExercise.type === '1' || selectedExercise.type === '3' ? {
        content: selectedExercise.content,
        missing_words: selectedExercise.missingWords
      } : {
        content: selectedExercise.content,
        answers: selectedExercise.answers,
        correct_answer: selectedExercise.correctAnswer
      },
      correct_answers: selectedExercise.type === '1' ? (
        selectedExercise.missingWords.map(missingWord => missingWord.word)
      ) : selectedExercise.type === '3' ? (
        selectedExercise.missingWords.map(missingWord => missingWord.word)
      ) : (
        [selectedExercise.correctAnswer]
      )
    };
    updateExerciseMutation.mutate(
      { exerciseId: selectedExercise.id, exerciseData },
      {
        onSuccess: (updatedExercise) => {
          setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
          setSelectedExercise(updatedExercise);
        },
        onError: (error) => {
          console.error('Ошибка при обновлении упражнения', error);
          // Добавьте здесь обработку ошибки, например, показ сообщения пользователю
        },
      }
    );
  };

  const removeExercise = (exerciseId) => {
    setExercises(exercises.filter(exercise => exercise.id !== exerciseId));
    setSelectedExercise(null);
  };

  const { data: libraryExercises } = useQuery('exercises', fetchExercises);

  return (
    <div>
      <div className='color-2'>
        <Container className="d-flex flex-column align-items-center justify-content-center">
          <Row>
            <input className='title-test ' placeholder={'Введите название теста'}></input>
            <textarea className='description-test' placeholder='Введите описание теста'>
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

          </Row>
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
        </Container>
      </div>

      <div className='exercise-editor'>
        <Container>
          {selectedExercise ? (
            parseInt(selectedExercise.type) === 1 ? (
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
                    {renderContentWithButtonsType1(selectedExercise.content)}
                  </div>
                )}
              </div>
            ) : parseInt(selectedExercise.type) === 2 ? (
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
                <p>Название упражнения <input value={selectedExercise.name} onChange={e => handleExerciseFieldChange(e, "name")} /></p>
                <p>Описание упражнения <input value={selectedExercise.description} onChange={e => handleExerciseFieldChange(e, "description")} /></p>
                <Row className="align-items-center">
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
                </Row>
              </div>
            ) : parseInt(selectedExercise.type) === 3 ? (
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
                    {renderContentWithButtonsType3(selectedExercise.content)}
                  </div>
                )}
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
                <Dropdown.Item onClick={() => handleSelectType('3')}>Пропущенные буквы</Dropdown.Item>
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