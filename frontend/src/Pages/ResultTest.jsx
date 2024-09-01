import React from "react";
import './style.css'
import { Container, Row, Col, Button } from 'react-bootstrap'
import { getResponseTest } from "./Components/api";
import Result from "./Components/ResultItem";
import { useQuery } from "react-query";

const ResultTest = () => {
    const { data: responseTest, isLoading, error } = useQuery('response', getResponseTest);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div>
            <div className='color-2'>
                <Container>
                    <Row>
                        <Col><h1 className="white-text">Страница просмотра результатов тестирования</h1></Col>
                        <Col>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container>
                <Row>
                    {responseTest?.length > 0 ? (
                        responseTest.map((result, index) => (
                            <Result
                                key={index}
                                test={result.test}
                                user={result.user.first_name}
                                json_result={result.json_result}
                                link={`/result-test/test/${result.id}/`}
                            />
                        ))
                    ) : (
                        <div className='text-center'>
                            <h1 className='text-center'>Тестов нет</h1>
                            <p>Решенных тестов нет
                            </p>
                        </div>
                    )}
                </Row>
            </Container>
        </div>
    )
}

export default ResultTest;