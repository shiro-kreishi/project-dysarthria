import React from "react";
import { Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import './style.css'
const FinallResult = () => {
  const navigate = useNavigate()
  const location = useLocation();
  const results = location.state?.results;

  if (!results) {
    return <h1>Результаты не найдены</h1>;
  }

  const totalAnswers = results.length;
  const correctAnswers = results.filter(result => JSON.stringify(result.user_answer) === JSON.stringify(result.correct_answer)).length;
  const percentageCorrect = totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(2) : 0;

  return (
    <div>
      <Container>
        <Row>
          <h1>Тест пройден</h1>
        </Row>
        <Row>
          <Col>
            <h2>Правильных ответов: {correctAnswers} из {totalAnswers}</h2>
            <h2>Процент правильных ответов: {percentageCorrect}%</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <ListGroup>
              {results.map((result, index) => (
                <ListGroup.Item key={index} className={`result-item ${JSON.stringify(result.user_answer) === JSON.stringify(result.correct_answer) ? 'a-correct' : 'a-incorrect'}`}>
                  <div>
                    <strong>Упражнение {index + 1}:</strong>
                  </div>
                  <div>
                    <span>Ваш ответ: {JSON.stringify(result.user_answer)}</span>
                  </div>
                  <div>
                    <span>Правильный ответ: {JSON.stringify(result.correct_answer)}</span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <div className="d-flex justify-content-center mt-3">
              <Button onClick={() => navigate('/tests/')}>Вернуться на главную страницу</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default FinallResult;