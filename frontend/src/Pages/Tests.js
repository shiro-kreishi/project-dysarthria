import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button, FormControl } from 'react-bootstrap';
import './style.css';

import Test from './Components/TestItem';
import { DataContext } from './Components/DataContext';


const Tests = () => {
   const { publicTests} = useContext(DataContext);

   //if (loading) return <p>Загрузка...</p>;
   //if (error) return <p>Ошибка: {error}</p>;
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
                                <Button variant='outline-info'>Поиск</Button>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container>
                <Row>
                  {publicTests.length > 0 ? (
                        publicTests.map((test, index) => (
                            <Col key={index} sm={12} md={6} lg={4}>
                                <Test name={test.test.name} description={test.test.description} id={test.test.id}  link={`public-tests/${test.test.id}/`} />
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
