import React from 'react';
import { Container, Row, Col, Form, Button, FormControl } from 'react-bootstrap';
import './style.css';
import PublicTest from './Components/PublicTestItem';
import { useQueries, useQueryClient, useQuery} from 'react-query';
import { fetchPublicTests, fetchPublicTestById } from './Components/api';

const Tests = () => {
  const queryClient = useQueryClient();
  const { data: publicTests, isLoading, error } = useQuery(['public-tests'], fetchPublicTests);

  const testQueries = useQueries(
    publicTests?.map(test => ({
      queryKey: ['test', test.id],
      queryFn: () => fetchPublicTestById(test.id),
      enabled: !!publicTests
    })) || []
  );

  if (isLoading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  const isLoadingTests = testQueries.some(query => query.isLoading);
  const testData = testQueries.map(query => query.data).filter(Boolean);

  return (
    <div>
      <div className='color'>
        <Container className="h-100">
          <Row className="h-100 align-items-center">
            <Col>
              <h1 className="h-white ml-100">Каталог тестов</h1>
            </Col>
            <Col>
              <Form inline>
                <FormControl
                  type='text'
                  placeholder='Введите название или тип теста...'
                  className='mr-sm-2'
                />
              </Form>
            </Col>
          </Row>
        </Container>
      </div>
      <Container>
        <Row>
          {isLoadingTests ? (
            <p>Загрузка тестов...</p>
          ) : testData.length > 0 ? (
            testData.map((test) => (
              <Col key={test.id} sm={12} md={6} lg={2}>
                <PublicTest
                  name={test.test.name} 
                  description={test.description} 
                  id={test.id} 
                  link={`/public-tests/test/${test.test.id}/`} 
                />
              </Col>
            ))
          ) : (
            <div className='text-center'>
              <h1 className='text-center'>Тестов нет</h1>
              <p>Новые тесты скоро , если тестов нет - сообщите 
                администратору
              </p>
            </div>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default Tests;