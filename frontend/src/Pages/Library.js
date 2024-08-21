import { Container, Row, Col, Button, Toast} from 'react-bootstrap';
import { Link } from "react-router-dom";
import './style.css';
import { DataContext } from './Components/DataContext';
import ExerciseItem from './Components/ExerciseItem';
import Modal from './Components/Modal';
import useModal from '../hooks/useModal';
import { useContext, useEffect, useState } from 'react';
import Test from './Components/TestItem';

const Library = () => {
  const { exercises, loading, error, deleteExercise } = useContext(DataContext);
  const { isActive, openModal, closeModal } = useModal();
  const [exToDelete, setExToDelete] = useState(null);
  const [show, setShow] = useState(false);

  const handleDeleteExercise = (exerciseId) => {
    setExToDelete(exerciseId);
    openModal();
  };

  const confirmDeleteExercise = () => {
    deleteExercise(exToDelete);
    setExToDelete(null);
    closeModal();
  };

  useEffect(() => {
    const exerciseCreated = localStorage.getItem('exerciseCreated');
    if (exerciseCreated === 'true') {
      setShow(true);
      localStorage.removeItem('exerciseCreated');
    }
  }, []);

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  if (loading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="color">
        <Container>
          <Row className='align-items-center justify-content-between'>
          <Col>
          <h1 className="white-text">Библиотека упражнений</h1>
          <p className='white-text'>В этом разделе вы можете создать 
            упражнение, которое может использоваться
            в одном из созданных вами тестом

          </p>
          </Col>
          <Col>
          <Link to='/my-tests/add-exercise' className='btn btn-red'>Добавить упражнение</Link>
          </Col>
          
          </Row>
          
        </Container>
      </div>
      <Container>
        <Row>
          {exercises && exercises.length > 0 ? (
            exercises.map((exercise) => (
              <Col key={exercise.id} sm={12} md={6} lg={2}>
                <Button className='btn-delete' onClick={() => handleDeleteExercise(exercise.id)}>X</Button>
                <ExerciseItem name={exercise.name} />
              </Col>
            ))
          ) : (
            <Col>
              <p>Нет доступных упражнений.</p>
            </Col>
          )}
        </Row>
      </Container>
      <Modal isActive={isActive} closeModal={closeModal} >
        <Container className='text-center'>
        <h1>Удалить упражнение?</h1>
        <p>
          <Button onClick={confirmDeleteExercise}>Да</Button>
          <Button onClick={closeModal}>Нет</Button>
        </p>
        </Container>
      </Modal>
      <div className='toast-container'>
        <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg='success'>
          <Toast.Header>
            <strong className='me-auto'>Успешно!</strong>
          </Toast.Header>
          <Toast.Body className={'Daкk' && 'text-white'}>Упражнение успешно создано!</Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default Library;