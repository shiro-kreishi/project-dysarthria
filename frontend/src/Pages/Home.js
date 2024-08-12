import './style.css';
import { Container, Row, Col } from 'react-bootstrap';
import img from './new_img1.png';

function Home() {
  return (
    <div>
      <div className='color'>
        <Container>
          <Row>
            <Col>
              <img src={img} width='700px' alt='изображения'/>
            </Col>
            <Col>
              <h1 className='hwhite'>Добро пожаловать в "НАЗВАНИЕ"</h1>
              <span className='white-text'>
                «НАЗВАНИЕ» — это инновационное веб-приложение,
                созданное специально для логопедов, чтобы помочь
                вам в работе с пациентами, страдающими дизартрией.
              </span>
            </Col>
          </Row>
        </Container>
      </div>
      <Container>
        <Row>
          <Col></Col>
          <Col>
            <h1>Как начать?</h1>
            <ul>
              <li> Зарегистрируйтесь или войдите в свою учетную запись.</li>
              <li> Изучайте упражнения: Просматривайте каталог упражнений и выбирайте подходящие для ваших пациентов.</li>
              <li> Создавайте свои упражнения: Используйте нашу библиотеку материалов для создания уникальных занятий.</li>
              <li> Отслеживайте прогресс: Сохраняйте результаты и анализируйте успехи ваших пациентов.</li>
            </ul>
          </Col>
        </Row> 
      </Container>
    </div>
  );
}

export default Home;
