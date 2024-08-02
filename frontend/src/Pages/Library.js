import { Container, Row, Col } from 'react-bootstrap';
import './style.css';
import { DataContext } from './Components/DataContext';
import Test from './Components/TestItem';
import { useContext, useEffect, useState } from 'react';
import axiosConfig from './Components/AxiosConfig';
import ExerciseItem from './Components/ExerciseItem';

const Library = () => {
  const [exercises, setExercises] = useState([]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await axiosConfig.get("/api/v0/exercises/");
        setExercises(response.data);
      } catch (error) {
        console.error("Ошибка при загрузке упражнений:", error);
      }
    };

    fetchExercises();
  }, []); // Пустой массив зависимостей означает, что эффект выполнится только при монтировании компонента

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
              <ExerciseItem name={exercise.name}/>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Library;
