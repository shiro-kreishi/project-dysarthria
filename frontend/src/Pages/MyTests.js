import React, { useContext, useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, FormControl, Toast } from 'react-bootstrap';
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
    const [show, setShow] = useState(false);

    const handleDeleteTest = (testId) => {
        setTestToDelete(testId);
        openModal();
    };

    const confirmDeleteTest = () => {
        deleteTest(testToDelete);
        setTestToDelete(null);
        closeModal();
    };

    useEffect(() => {
        const testCreated = localStorage.getItem('testCreated');
        if (testCreated === 'true') {
            setShow(true);
            localStorage.removeItem('testCreated');
        }
    }, []);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>Ошибка: {error}</p>;
    return (
        <div>
            <div className='color'>
                <Container className="h-100">
                    <Row className="h-100 align-items-center justify-content-between">
                        <Col className='aling-items-center justify-content-'>
                            <h1 className="h-white ml-100">Мои тесты</h1>
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
                        <Col lg={2} sm={3} className="d-flex justify-content-end">
                            <Button variant='outline-info'>Поиск</Button>
                        </Col>
                        <Col lg={2} className="d-flex justify-content-end">
                            <Link to='/my-tests/add-test' className='btn btn-red '>Добавить тест</Link>
                        </Col>
                        <Col lg={2} className="d-flex justify-content-end">
                            <Link to='/my-tests/add-exercise' className='btn btn-red'>Добавить упражнение</Link>
                        </Col>
                    </Row>
                </Container>
            </div>
            <Container>
                <Row clas>
                    {tests.length > 0 ? (
                        tests.map((test, index) => (
                            <Col key={index} sm={12} md={6} lg={2}>
                                <Button className='btn-delete' onClick={() => handleDeleteTest(test.id)}>X</Button>
                                <Test name={test.name} description={test.description} id={test.id} link={`/my-tests/test/${test.id}`} />
                            </Col>
                        ))
                    ) : (
                        <div className='text-center'>
                            <h1 className='text-center'>Тестов нет</h1>
                            <p>Добавьте новые тесты. Если тесты не
                                добавляются - обратитесь к администратору
                            </p>
                        </div>
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

            <div className="toast-container">
                <Toast onClose={() => setShow(false)} show={show} delay={3000} autohide bg='success'>
                    <Toast.Header>
                        <strong className='me-auto'>Успешно!</strong>
                    </Toast.Header>
                    <Toast.Body className={'Dark' && 'text-white'}>Тест и упражнения к нему успешно созданы.</Toast.Body>
                </Toast>
            </div>
        </div>
    );
};

export default MyTests;