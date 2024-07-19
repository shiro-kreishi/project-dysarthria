import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import './style.css';
import Modal from './Components/Modal';
import axios from 'axios';
import { DataContext } from './Components/DataContext';


const AddTest = () => {
  const client = axios.create({
    baseURL: "http://127.0.0.1:8000"
  });
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [modalActive, setModalActive] = useState(false);
  const [selectedType, setSelectedType] = useState('text');   
  const [showWordButtons, setShowWordButtons] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  
  const saveJSONToFile = (data, filename) => {
    const file = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(file);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const compressionExercise = (exercises) => {
    return exercises.map(exercise => {
      let king_json = {};
  
      if (exercise.type === 'text') {
        king_json = {
          content: exercise.content,
          missing_words: exercise.missingWords
        };
      } else if (exercise.type === 'image') {
        king_json = {
          content: exercise.content,
          answers: exercise.answers,
          correct_answer: exercise.correctAnswer
        };
      }
  
      return {
        id: exercise.id,
        name: exercise.name || '',
        type: exercise.type,
        king_json: king_json
      };
    });
  };
  
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
  

  const submitData = () => {
    client.post('/api/endpoint/', {
      key: 'value'
    }, {
      headers: {
        'X-CSRFToken': csrftoken
      },
      withCredentials: true
    })
    .then(response => { 
      console.log(response.data);
    })
    .catch(error => {
      console.error('There was an error!', error);
    });
  };


  const SaveTest = async () => {
    const test = {
      name: document.querySelector('.title-test').value,
      // description: 'test',
    };
  
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v0/exercise-types/', test, {
        headers: {
          'X-CSRFToken': csrftoken,
          'Content-Type': 'application/json', // Убедитесь, что заголовок Content-Type установлен
        },
        withCredentials: true,
      });
      console.log('Тест успешно сохранен', response.data);
      navigate('/my-tests');
      submitData();
    } catch (error) {
      console.error('Ошибка при сохранении теста', error);
      console.log(test);
      console.log(csrftoken);
      console.log(client.baseURL);
    }
  };
  
  const addExercise = (type) => {
    let newExercise;
    if (type === 'text') {
      newExercise = { id: exercises.length + 1, type: type, content: '', missingWords: [] };
    } else if (type === 'image') {
      newExercise = { id: exercises.length + 1, type: type, content: '', answers: [], correctAnswer: '' };
    }
    setExercises([...exercises, newExercise]);
    setSelectedExercise(newExercise);
    setModalActive(false);
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

  const addAnswer = () =>{
    const updatedExercise = { 
      ...selectedExercise, 
      answers: [...selectedExercise.answers, '']
    };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  }

  const setCorrectAnswer = (answer) => {
    const updatedExercise = { ...selectedExercise, correctAnswer: answer };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise);
  };

  

  const AnswerChange = (index, value) =>{
    const updatedAnswers = [...selectedExercise.answers];
    updatedAnswers[index] = value;
    const updatedExercise = { ...selectedExercise, answers: updatedAnswers };
    setExercises(exercises.map(ex => ex.id === updatedExercise.id ? updatedExercise : ex));
    setSelectedExercise(updatedExercise); 
  }
  return (
    <div>
      <div className='color-2'>
        <Container>
          <Row>
            <Col></Col>
            <Col>
              <input className='title-test' placeholder={'введите название теста'} ></input>
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
                <Button className='add-btn' onClick={() => setModalActive(true)}>Добавить</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className='exercise-editor'>
        <Container>
        {selectedExercise ? (
          selectedExercise.type === 'text' ? (
            <div>
              <h3>Редактор упражнения {selectedExercise.id}</h3>
              <textarea
                className='textarea'
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
          ) : selectedExercise.type === 'image' ? (
            <div>
              <h3>Редактор изображения {selectedExercise.id}</h3>
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
                  <Button onClick={addAnswer} >Добавить вариант ответа</Button>
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

    <Modal active={modalActive} setActive={setModalActive}>
      <h1>Выберите тип упражнения</h1>
      <DropdownButton id="dropdown-basic-button" title="Тип">
        <Dropdown.Item onClick={() => handleSelectType('text')}>Пропущенные слова</Dropdown.Item>
        <Dropdown.Item onClick={() => handleSelectType('image')}>Что на изображении</Dropdown.Item>
        <Dropdown.Item onClick={() => handleSelectType('other')}>Something else</Dropdown.Item>
      </DropdownButton>
    </Modal>
  </div>
  );
};

export default AddTest;
