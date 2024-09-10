import { Container, Row, Col, Button, Toast } from 'react-bootstrap';
import { Link } from "react-router-dom";
import './style.css';
import ExerciseItem from './Components/ExerciseItem';
import Modal from './Components/Modal';
import useModal from '../hooks/useModal';
import { useContext, useEffect, useState } from 'react';
import { fetchExercises, deleteExercise } from './Components/api';
import { useQuery, useQueryClient } from 'react-query';

const Library = () => {
  const { isActive, openModal, closeModal } = useModal();
  const [exToDelete, setExToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const handleDeleteExercise = (exerciseId) => {
    setExToDelete(exerciseId);
    openModal();
  };

  const confirmDeleteExercise = async () => {
    await deleteExercise(exToDelete);
    setExToDelete(null);
    closeModal();
    queryClient.invalidateQueries('exercises');
  };

  const queryClient = useQueryClient();
  const { data: exercises, isLoading, error } = useQuery('exercises', fetchExercises);

  useEffect(() => {
    const exerciseCreated = localStorage.getItem('exerciseCreated');
    if (exerciseCreated === 'true') {
      setShowToast(true);
      localStorage.removeItem('exerciseCreated');
    }
  }, []);

  if (error) {
    return <div>Ошибка: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Загрузка...</div>;
  }

  return (
    <div>
      <div className="color">
        <Container>
          <Row className='align-items-center justify-content-between'>
            <Col>
              <h1 className="white-text">Библиотека упражнений</h1>
              <p className='white-text'>
                В этом разделе вы можете создать упражнение, которое может использоваться в одном из созданных вами тестов.
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
                <ExerciseItem name={exercise.name} description={exercise.description} id={exercise.id} onDelete={() => handleDeleteExercise(exercise.id)} />
              </Col>
            ))
          ) : (
            <Col>
              <p>Нет доступных упражнений.</p>
            </Col>
          )}
        </Row>
      </Container>
      <Modal isActive={isActive} closeModal={closeModal}>
        <Container className='text-center'>
          <h1>Удалить упражнение?</h1>
          <p>
            <Button onClick={confirmDeleteExercise}>Да</Button>
            <Button onClick={closeModal}>Нет</Button>
          </p>
        </Container>
      </Modal>
      <div className='toast-container'>
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide bg='success'>
          <Toast.Header>
            <strong className='me-auto'>Успешно!</strong>
          </Toast.Header>
          <Toast.Body className='text-white'>Упражнение успешно создано!</Toast.Body>
        </Toast>
      </div>
    </div>
  );
};

export default Library;