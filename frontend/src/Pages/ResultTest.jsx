import React from "react";
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
            <div className='color'>
                <Container>
                    <Row>
                        <p className="h-white">Страница просмотра результатов тестирования</p>
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
                                user={result.user?.first_name}
                                json_result={result.json_result}
                                link={`/result-test/test/${result.id}/`}
                            />
                        ))
                    ) : (
                        <div className='text-center'>
                            <h1 className='text-center'>Пройденный тестов нет</h1>
                            <p>
                                Ожидайте список результатов тестов. Если тестов нет - обратитесь к администратору
                            </p>
                        </div>
                    )}
                </Row>
            </Container>
        </div>
    )
}

export default ResultTest;