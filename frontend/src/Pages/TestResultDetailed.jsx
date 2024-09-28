import React, { useState, useEffect } from "react";
import { Container, Row, Col, ListGroup, Button } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axiosConfig from "./Components/AxiosConfig";
import './style.css';
import { fetchTestById } from "./Components/api";

const FinallResult = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [results, setResults] = useState(null);
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axiosConfig.get(`/api/v0/response-tests/${id}/`);
        setResults(JSON.parse(response.data.json_result));
        setData(response.data)

        
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
      
    };

    fetchResults();
    
    console.log(results);
  }, [id]);

  if (isLoading) {
    return <h1>Загрузка результатов...</h1>;
  }

  if (error) {
    return <h1>Ошибка при загрузке результатов: {error.message}</h1>;
  }

  if (!results) {
    return <h1>Результаты не найдены</h1>;
  }
  
  const totalAnswers = results.length;
  const correctAnswers = results.filter(result => JSON.stringify(result.user_answer) === JSON.stringify(result.correct_answer)).length;
  const percentageCorrect = totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(2) : 0;

  return (
    <div>
      <Container>
        
        <Row className="tale">
          <h1>{data.test} пройден</h1>
          <Col>
            <h2>Правильных ответов: {correctAnswers} из {totalAnswers}</h2>
            <h2>Процент правильных ответов: {percentageCorrect}%</h2>
          </Col>
        </Row>
        <Row>
          <Col>
            <ListGroup>
              {results.map((result, index) => (
                <ListGroup.Item key={index} className={`${JSON.stringify(result.user_answer) === JSON.stringify(result.correct_answer) ? 'a-correct tale' : 'a-incorrect tale'}`}>
                  <div>
                    <strong>Упражнение {index + 1}:</strong>
                  </div>
                  <div>
                    <span>Ответ {data.user?.email}: {JSON.stringify(result.user_answer)}</span>
                  </div>
                  <div>
                    <span>Правильный ответ: {JSON.stringify(result.correct_answer)}</span>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
            <div className="d-flex justify-content-center mt-3">
              <Button onClick={() => navigate('/result-test')}>Вернуться на главную страницу</Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default FinallResult;