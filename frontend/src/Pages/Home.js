import './style.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import img from './new_img1.png';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate =useNavigate();
  return (
    <div>
      <div className='color'>
        <Container>
          <Row className='align-items-center text-center'>

              <h1 className='white-text'>Добро пожаловать в "НАЗВАНИЕ"</h1>
              <span className='white-text'>
                «НАЗВАНИЕ» — это инновационное веб-приложение,
                созданное специально для логопедов, чтобы помочь
                вам в работе с пациентами, страдающими дизартрией.
              </span>
              <p><Button onClick={() => navigate('/tests/')}>Начать проходить тесты</Button></p>

          </Row>
        </Container>
      </div>
      <Container className='text-center'>
        <Row className='justify-content-center'>
          <Col xs={12} md={8}>
            <h1>Как начать?</h1>
            <ul className='list-unstyled home-list'>
              <li>Зарегистрируйтесь или войдите в свою учетную запись.</li>
              <li>Изучайте упражнения: Просматривайте каталог упражнений и выбирайте подходящие для ваших пациентов.</li>
              <li>Создавайте свои упражнения: Используйте нашу библиотеку материалов для создания уникальных занятий.</li>
              <li>Отслеживайте прогресс: Сохраняйте результаты и анализируйте успехи ваших пациентов.</li>
            </ul>
          </Col>
        </Row> 
      </Container>
    </div>
  );
}

export default Home;