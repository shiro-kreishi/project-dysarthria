import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, Button, FormControl } from 'react-bootstrap';
import './style.css';
import { Link } from "react-router-dom";
import Test from './Components/TestItem';
import { DataContext } from './Components/DataContext';
import Modal from './Components/Modal';
import useModal from '../hooks/useModal';

const MyTests = () => {
   const { tests, loading, error, deleteTest } = useContext(DataContext);
   const { isActive, openModal, closeModal } = useModal();
   const [testToDelete, setTestToDelete] = useState(null);

   const handleDeleteTest = (testId) => {
     setTestToDelete(testId);
     openModal();
   };

   const confirmDeleteTest = () => {
     deleteTest(testToDelete);
     setTestToDelete(null);
     closeModal();
   };

   if (loading) return <p>Загрузка...</p>;
   if (error) return <p>Ошибка: {error}</p>;
   return (
        <div>
            <div className='color'>
                <Container className="h-100">
                    <Row className="h-100 align-items-center">
                        <Col>
                            <h1 className="h-white ml-100">Мои тесты</h1>
                        </Col>
                        <Col>
                            <Form inline>
                                <FormControl
                                    type='text'
                                    placeholder='Введите название или тип теста...'
                                    className='mr-sm-2'
                                />
                                <Button variant='outline-info'>Поиск</Button>
                                <Link to='/my-tests/add-test' className='btn btn-red'>Добавить тест</Link>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container>
                <Row>
                  {tests.length > 0 ? (
                        tests.map((test, index) => (
                            <Col key={index}>
                                <Button className='btn-delete' onClick={() => handleDeleteTest(test.id)}>X</Button>
                                <Test name={test.name} description={test.description} id={test.id} />
                            </Col>
                        ))
                    ) : (
                        <p>Тестов нет. Добавьте новые тесты!</p>
                  )}
                </Row>
            </Container>
            <Modal isActive={isActive} closeModal={closeModal}>
                <h1>Удалить выбранный тест?</h1>
                <p>
                  <Button onClick={confirmDeleteTest}>Да</Button>
                  <Button onClick={closeModal}>Нет</Button>
                </p>
            </Modal>
        </div>
    );
};

export default MyTests;
