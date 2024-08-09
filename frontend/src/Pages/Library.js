import { Container, Row, Col, Button } from 'react-bootstrap';
import './style.css';
import { DataContext } from './Components/DataContext';
import Test from './Components/TestItem';
import { useContext, useEffect, useState } from 'react';
import axiosConfig from './Components/AxiosConfig';
import ExerciseItem from './Components/ExerciseItem';
import Modal from './Components/Modal';
import useModal from '../hooks/useModal';


const Library = () => {
  const {exercises, loading, error, deleteExercise} = useContext(DataContext);
  const {isActive, openModal, closeModal} = useModal();
  const [exToDelete, setExToDelete] = useState(null);


  const handleDeleteExercise = (exerciseId) => {
    setExToDelete(exerciseId);
    openModal();
  }

  const confirmDeleteExercise =() => {
    deleteExercise(exToDelete);
    setExToDelete(null);
    closeModal();
  }

  
  if (error) return 'Ошибка';
  if (loading) return 'Загрузка'
  return (
    <div>
      <div className="color">
        <Container>
          <h1 className="white-text">Библиотека упражнений</h1>
        </Container>
      </div>
      <Container>
        <Row>
          {exercises.map((exercise) => (
            <Col key={exercise.id} sm={12} md={6} lg={4}>
              <Button className='btn-delete' onClick={() => handleDeleteExercise(exercise.id)}>X</Button>
              <ExerciseItem name={exercise.name}/>
            </Col>
          ))}
        </Row>
      </Container>
      <Modal isActive={isActive} closeModal={closeModal}>
        <h1>Удалить упражнение?</h1>
        <p>
          <Button onClick={confirmDeleteExercise}>Да</Button>
          <Button onClick={closeModal}>Нет</Button>
        </p>
      </Modal>
    </div>  
  );
};  

export default Library;
